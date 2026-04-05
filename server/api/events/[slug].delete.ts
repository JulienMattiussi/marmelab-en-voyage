import { readEvent, deleteEvent } from '~/server/utils/events';

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug');
  if (!slug) throw createError({ statusCode: 400, message: 'slug is required' });

  if (!(await readEvent(slug))) throw createError({ statusCode: 404, message: 'Event not found' });

  await deleteEvent(slug);

  return { ok: true };
});
