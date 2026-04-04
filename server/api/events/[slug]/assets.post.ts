import { readMultipartFormData } from 'h3';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { readEvent, writeEvent } from '~/server/utils/events';

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug');
  if (!slug) throw createError({ statusCode: 400, message: 'Missing slug' });

  const existing = readEvent(slug);
  if (!existing) throw createError({ statusCode: 404, message: `Event "${slug}" not found` });

  const formData = await readMultipartFormData(event);
  if (!formData) throw createError({ statusCode: 400, message: 'No form data' });

  const filePart = formData.find((p) => p.name === 'file');
  const fieldPart = formData.find((p) => p.name === 'field');

  if (!filePart?.data || !filePart.filename) {
    throw createError({ statusCode: 400, message: 'Missing file' });
  }
  if (!fieldPart?.data) {
    throw createError({ statusCode: 400, message: 'Missing field name (background | goal)' });
  }

  const field = fieldPart.data.toString() as 'background' | 'goal';
  if (!['background', 'goal'].includes(field)) {
    throw createError({ statusCode: 400, message: 'field must be "background" or "goal"' });
  }

  const ext = extname(filePart.filename);
  const filename = `${field}${ext}`;
  const dir = join(process.cwd(), 'public', 'events', slug);

  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, filename), filePart.data);

  const publicPath = `/events/${slug}/${filename}`;

  // Update the event's visuals reference
  existing.visuals[field] = publicPath;
  writeEvent(slug, existing);

  return { path: publicPath };
});
