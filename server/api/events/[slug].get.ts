import { readEvent } from '~/server/utils/events';

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug');
  if (!slug) throw createError({ statusCode: 400, message: 'Missing slug' });

  const data = await readEvent(slug);
  if (!data) throw createError({ statusCode: 404, message: `Event "${slug}" not found` });

  return data;
});
