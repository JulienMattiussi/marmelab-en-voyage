/**
 * One-time script to seed the private Vercel Blob store with local content data.
 * Run with the private store token:
 *   BLOB_DATA_READ_WRITE_TOKEN=<token> node scripts/seed-blob.mjs
 */
import { put } from '@vercel/blob';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const token = process.env.BLOB_DATA_READ_WRITE_TOKEN;

const contentDir = join(process.cwd(), 'content');

// Seed participants.json
const participantsPath = join(contentDir, 'participants.json');
if (existsSync(participantsPath)) {
  const content = readFileSync(participantsPath, 'utf-8');
  await put('participants.json', content, {
    access: 'private',
    token,
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  console.log('✓ participants.json');
}

// Seed all event JSON files
const eventsDir = join(contentDir, 'events');
if (existsSync(eventsDir)) {
  for (const file of readdirSync(eventsDir)) {
    if (!file.endsWith('.json')) continue;
    const content = readFileSync(join(eventsDir, file), 'utf-8');
    await put(`events/${file}`, content, {
      access: 'private',
      token,
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    console.log(`✓ events/${file}`);
  }
}

console.log('Seeding complete.');
