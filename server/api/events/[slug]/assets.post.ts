import { readMultipartFormData } from 'h3';
import { extname } from 'node:path';
import { readEvent, writeEvent } from '~/server/utils/events';
import { getStorage } from '~/server/utils/storage';

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug');
  if (!slug) throw createError({ statusCode: 400, message: 'Missing slug' });

  const existing = await readEvent(slug);
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
  const contentType = filePart.type ?? 'application/octet-stream';
  const storage = await getStorage();
  const url = await storage.putAsset(`events/${slug}/${field}${ext}`, filePart.data, contentType);

  existing.visuals[field] = url;
  await writeEvent(slug, existing);

  return { path: url };
});
