import { put, list, del } from '@vercel/blob';
import type { StorageDriver } from './types';

export class VercelBlobDriver implements StorageDriver {
  async readJSON(key: string): Promise<string | null> {
    const { blobs } = await list({ prefix: key, limit: 1 });
    if (!blobs.length) return null;
    const res = await fetch(blobs[0]!.url);
    return res.text();
  }

  async writeJSON(key: string, content: string): Promise<void> {
    await put(key, content, {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
    });
  }

  async listJSONKeys(prefix: string): Promise<string[]> {
    const { blobs } = await list({ prefix: `${prefix}/`, limit: 1000 });
    return blobs.map((b) => b.pathname);
  }

  async deleteJSON(key: string): Promise<void> {
    const { blobs } = await list({ prefix: key, limit: 1 });
    if (blobs.length) await del(blobs[0]!.url);
  }

  async putAsset(key: string, data: Buffer, contentType: string): Promise<string> {
    const { url } = await put(key, data, {
      access: 'public',
      contentType,
      addRandomSuffix: false,
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
