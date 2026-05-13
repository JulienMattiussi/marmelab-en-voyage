import { put, list, del, get } from '@vercel/blob';
import type { StorageDriver } from './types';

export class VercelBlobDriver implements StorageDriver {
  async readJSON(key: string): Promise<string | null> {
    const result = await get(key, { access: 'public' });
    if (!result || result.statusCode !== 200) return null;
    return new Response(result.stream).text();
  }

  async writeJSON(key: string, content: string): Promise<void> {
    await put(key, content, {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
    });
  }

  async listJSONKeys(prefix: string): Promise<string[]> {
    const { blobs } = await list({ prefix: `${prefix}/`, limit: 1000 });
    return blobs.map((b) => b.pathname);
  }

  async deleteJSON(key: string): Promise<void> {
    await del(key);
  }

  async putAsset(key: string, data: Buffer, contentType: string): Promise<string> {
    const { url } = await put(key, data, {
      access: 'public',
      contentType,
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return url;
  }

  async deleteAssetsByPrefix(prefix: string): Promise<void> {
    let cursor: string | undefined;
    do {
      const result = await list({ prefix: `${prefix}/`, limit: 100, cursor });
      if (result.blobs.length) await del(result.blobs.map((b) => b.url));
      cursor = result.cursor;
    } while (cursor);
  }
}
