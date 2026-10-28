/**
 * One-time script: copy the JSON data (participants and events) from the public
 * Blob store to the private one. Images stay in the public store. The source is
 * left untouched, so the script can be run again safely.
 *
 *   node --env-file=.env.migration scripts/migrate-json-to-private.mjs
 *
 * BLOB_READ_WRITE_TOKEN: public store (source), BLOB_DATA_READ_WRITE_TOKEN: private store (target).
 */
import { list, get, put } from '@vercel/blob';

const sourceToken = process.env.BLOB_READ_WRITE_TOKEN;
const targetToken = process.env.BLOB_DATA_READ_WRITE_TOKEN;
if (!sourceToken || !targetToken) {
  console.error('BLOB_READ_WRITE_TOKEN and BLOB_DATA_READ_WRITE_TOKEN are required');
  process.exit(1);
}

const { blobs: events } = await list({ prefix: 'events/', token: sourceToken, limit: 1000 });
const keys = ['participants.json', ...events.map((b) => b.pathname).filter((p) => p.endsWith('.json'))];

for (const key of keys) {
  const source = await get(key, { access: 'public', token: sourceToken });
  if (!source || source.statusCode !== 200) {
    console.log(`- ${key} (missing in the public store, skipped)`);
    continue;
  }
  const content = await new Response(source.stream).text();
  JSON.parse(content); // refuse to copy a corrupted file
  await put(key, content, {
    access: 'private',
    token: targetToken,
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  console.log(`✓ ${key}`);
}

console.log('Migration complete.');
