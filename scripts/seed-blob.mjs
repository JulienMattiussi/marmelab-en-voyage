/**
 * One-time script to seed Vercel Blob with local content data.
 * Run with the production token:
 *   BLOB_READ_WRITE_TOKEN=<token> node scripts/seed-blob.mjs
 */
import { put } from '@vercel/blob';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const contentDir = join(process.cwd(), 'content');

// Seed participants.json
const participantsPath = join(contentDir, 'participants.json');
if (existsSync(participantsPath)) {
  const content = readFileSync(participantsPath, 'utf-8');
  await put('participants.json', content, {
    access: 'public',
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
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    console.log(`✓ events/${file}`);
  }
}

console.log('Seeding complete.');
