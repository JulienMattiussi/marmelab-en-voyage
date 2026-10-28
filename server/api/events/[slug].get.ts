import { readEvent } from '~/server/utils/events';
import { readOptionsFor } from '~/server/utils/readOptions';

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug');
  if (!slug) throw createError({ statusCode: 400, message: 'Missing slug' });

  const data = await readEvent(slug, await readOptionsFor(event));
  if (!data) throw createError({ statusCode: 404, message: `Event "${slug}" not found` });

  return data;
});
