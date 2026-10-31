/**
 * Copy the production data from the private Vercel Blob store into the local content/
 * folder, so that seed-blob.mjs re-seeds the current production data.
 * Run with the private store token:
 *   BLOB_DATA_READ_WRITE_TOKEN=<token> node scripts/pull-blob.mjs
 */
import { get, list } from '@vercel/blob';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const token = process.env.BLOB_DATA_READ_WRITE_TOKEN;
if (!token) {
  console.error('BLOB_DATA_READ_WRITE_TOKEN is required');
  process.exit(1);
}

const contentDir = join(process.cwd(), 'content');
mkdirSync(join(contentDir, 'events'), { recursive: true });

const pull = async (key) => {
  const result = await get(key, { access: 'private', token, useCache: false });
  if (!result || result.statusCode !== 200) throw new Error(`Cannot read ${key}`);
  // Re-indent so the diff with the versioned files stays readable.
  const content = JSON.parse(await new Response(result.stream).text());
  writeFileSync(join(contentDir, key), `${JSON.stringify(content, null, 2)}\n`);
  console.log(`✓ ${key}`);
};

await pull('participants.json');

const { blobs } = await list({ prefix: 'events/', limit: 1000, token });
for (const { pathname } of blobs) {
  if (pathname.endsWith('.json')) await pull(pathname);
}

console.log('Pull complete. Check the diff before committing.');
