import { existsSync, unlinkSync } from '~/server/utils/fs';
import { join } from 'node:path';

export default defineEventHandler((event) => {
  const slug = getRouterParam(event, 'slug');
  if (!slug) throw createError({ statusCode: 400, message: 'slug is required' });

  const path = join(process.cwd(), 'content', 'events', `${slug}.json`);
  if (!existsSync(path)) throw createError({ statusCode: 404, message: 'Event not found' });

  unlinkSync(path);
  return { ok: true };
});
