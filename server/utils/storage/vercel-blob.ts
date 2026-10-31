import { put, list, del, get } from '@vercel/blob';
import config from '~/server/utils/config';
import type { ReadOptions, StorageDriver } from './types';

// Vercel Blob occasionally rejects reads for a short while (403 seen in production
// while far below the plan limits). Retry before giving up with an explicit 503.
const RETRY_DELAYS_MS = [500, 1_500, 3_000];

const withRetry = async <T>(operation: () => Promise<T>): Promise<T> => {
  for (let attempt = 0; ; attempt++) {
    try {
      return await operation();
    } catch (e) {
      const delay = RETRY_DELAYS_MS[attempt];
      if (delay === undefined) {
        console.error(e);
        throw createError({
          statusCode: 503,
          message: 'Stockage temporairement indisponible, réessayez dans quelques instants',
        });
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

// Two stores: JSON data lives in a private store, which can be read without the CDN
// cache; images live in a public store so pages can link to them directly.
// Tokens are always passed explicitly: the SDK would otherwise pick BLOB_STORE_ID
// (set by Vercel when connecting a store) over BLOB_READ_WRITE_TOKEN.
export class VercelBlobDriver implements StorageDriver {
  private dataToken = config.get('blobDataToken');
  private assetsToken = config.get('blobAssetsToken');

  async readJSON(key: string, { cached = false }: ReadOptions = {}): Promise<string | null> {
    return withRetry(async () => {
      const result = await get(key, { access: 'private', token: this.dataToken, useCache: cached });
      if (!result || result.statusCode !== 200) return null;
      return new Response(result.stream).text();
    });
  }

  async writeJSON(key: string, content: string): Promise<void> {
    await put(key, content, {
      access: 'private',
      token: this.dataToken,
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
    });
  }

  async listJSONKeys(prefix: string): Promise<string[]> {
    const { blobs } = await withRetry(() =>
      list({ prefix: `${prefix}/`, limit: 1000, token: this.dataToken }),
    );
    return blobs.map((b) => b.pathname);
  }

  async deleteJSON(key: string): Promise<void> {
    await del(key, { token: this.dataToken });
  }

  async putAsset(key: string, data: Buffer, contentType: string): Promise<string> {
    const { url } = await put(key, data, {
      access: 'public',
      token: this.assetsToken,
      contentType,
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return `${url}?v=${Date.now()}`;
  }

  async deleteAssetsByPrefix(prefix: string): Promise<void> {
    let cursor: string | undefined;
    do {
      const result = await list({ prefix: `${prefix}/`, limit: 100, cursor, token: this.assetsToken });
      if (result.blobs.length) await del(result.blobs.map((b) => b.url), { token: this.assetsToken });
      cursor = result.cursor;
    } while (cursor);
  }
}
