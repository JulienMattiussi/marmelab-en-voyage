import { join, dirname } from 'node:path';
import { existsSync, readFileSync, writeFileSync, readdirSync, unlinkSync, mkdirSync, rmSync } from '~/server/utils/fs';
import type { StorageDriver } from './types';

export class LocalDriver implements StorageDriver {
  private contentDir = join(process.cwd(), 'content');
  private publicDir = join(process.cwd(), 'public');

  async readJSON(key: string): Promise<string | null> {
    const path = join(this.contentDir, key);
    if (!existsSync(path)) return null;
    return readFileSync(path, 'utf-8') as string;
  }

  async writeJSON(key: string, content: string): Promise<void> {
    writeFileSync(join(this.contentDir, key), content, 'utf-8');
  }

  async listJSONKeys(prefix: string): Promise<string[]> {
    const dir = join(this.contentDir, prefix);
    if (!existsSync(dir)) return [];
    return (readdirSync(dir) as string[])
      .filter((f) => f.endsWith('.json'))
      .map((f) => `${prefix}/${f}`);
  }

  async deleteJSON(key: string): Promise<void> {
    const path = join(this.contentDir, key);
    if (existsSync(path)) unlinkSync(path);
  }

  async putAsset(key: string, data: Buffer, _contentType: string): Promise<string> {
    const filePath = join(this.publicDir, key);
    const dir = dirname(filePath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(filePath, data);
    return `/${key}`;
  }

  async deleteAssetsByPrefix(prefix: string): Promise<void> {
    const dir = join(this.publicDir, prefix);
    if (existsSync(dir)) rmSync(dir, { recursive: true });
  }
}
