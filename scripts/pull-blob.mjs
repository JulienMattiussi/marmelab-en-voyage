/**
 * Copy the production data from the private Vercel Blob store into the local content/
 * folder, so that seed-blob.mjs re-seeds the current production data.
 * Avatars uploaded in production (public Blob URLs) are downloaded into public/avatars/
 * and point to their local path again.
 * Run with the private store token:
 *   BLOB_DATA_READ_WRITE_TOKEN=<token> node scripts/pull-blob.mjs
 */
import { get, list } from '@vercel/blob';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, basename } from 'node:path';

const token = process.env.BLOB_DATA_READ_WRITE_TOKEN;
if (!token) {
  console.error('BLOB_DATA_READ_WRITE_TOKEN is required');
  process.exit(1);
}

const contentDir = join(process.cwd(), 'content');
mkdirSync(join(contentDir, 'events'), { recursive: true });

const read = async (key) => {
  const result = await get(key, { access: 'private', token, useCache: false });
  if (!result || result.statusCode !== 200) throw new Error(`Cannot read ${key}`);
  return JSON.parse(await new Response(result.stream).text());
};

// Re-indent so the diff with the versioned files stays readable.
const save = (key, content) => {
  writeFileSync(join(contentDir, key), `${JSON.stringify(content, null, 2)}\n`);
  console.log(`✓ ${key}`);
};

const pull = async (key) => save(key, await read(key));

const participants = await read('participants.json');
for (const participant of participants) {
  if (!participant.avatar.startsWith('http')) continue;
  const response = await fetch(participant.avatar);
  if (!response.ok) throw new Error(`Cannot download ${participant.avatar}`);
  const file = basename(new URL(participant.avatar).pathname);
  writeFileSync(join(process.cwd(), 'public', 'avatars', file), Buffer.from(await response.arrayBuffer()));
  participant.avatar = `/avatars/${file}`;
  console.log(`✓ avatars/${file}`);
}
save('participants.json', participants);

const { blobs } = await list({ prefix: 'events/', limit: 1000, token });
for (const { pathname } of blobs) {
  if (pathname.endsWith('.json')) await pull(pathname);
}

console.log('Pull complete. Check the diff before committing.');
