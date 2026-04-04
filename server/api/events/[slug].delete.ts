import { existsSync, unlinkSync, readdirSync } from '~/server/utils/fs';
import { join } from 'node:path';
import { rmSync } from 'node:fs';

export default defineEventHandler((event) => {
  const slug = getRouterParam(event, 'slug');
  if (!slug) throw createError({ statusCode: 400, message: 'slug is required' });

  const jsonPath = join(process.cwd(), 'content', 'events', `${slug}.json`);
  if (!existsSync(jsonPath)) throw createError({ statusCode: 404, message: 'Event not found' });

  unlinkSync(jsonPath);

  const assetsDir = join(process.cwd(), 'public', 'events', slug);
  if (existsSync(assetsDir)) {
    rmSync(assetsDir, { recursive: true });
  }

  return { ok: true };
});
