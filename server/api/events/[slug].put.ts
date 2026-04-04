import { readEvent, writeEvent } from '~/server/utils/events';
import type { Event } from '~/types/event';

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug');
  if (!slug) throw createError({ statusCode: 400, message: 'Missing slug' });

  const existing = readEvent(slug);
  if (!existing) throw createError({ statusCode: 404, message: `Event "${slug}" not found` });

  const body = await readBody<Partial<Event>>(event);

  const updated: Event = {
    ...existing,
    ...body,
    slug, // slug is immutable
    visuals: { ...existing.visuals, ...body.visuals },
  };

  writeEvent(slug, updated);
  return updated;
});
