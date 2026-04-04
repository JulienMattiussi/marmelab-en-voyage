import { readEvent, writeEvent } from '~/server/utils/events';
import type { TripEvent } from '~/types/event';

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug');
  if (!slug) throw createError({ statusCode: 400, message: 'Missing slug' });

  const existing = readEvent(slug);
  if (!existing) throw createError({ statusCode: 404, message: `Event "${slug}" not found` });

  const body = await readBody<Partial<TripEvent>>(event);

  const updated: TripEvent = {
    ...existing,
    ...body,
    slug, // slug is immutable via PUT
    visuals: { ...existing.visuals, ...body.visuals },
  };

  writeEvent(slug, updated);
  return updated;
});
