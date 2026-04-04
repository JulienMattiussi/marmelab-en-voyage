import { readEvent, writeEvent } from '~/server/utils/events';
import type { Event } from '~/types/event';

export default defineEventHandler(async (event) => {
  const body = await readBody<Event>(event);

  if (!body?.slug || !body.name) {
    throw createError({ statusCode: 400, message: 'slug and name are required' });
  }

  if (readEvent(body.slug)) {
    throw createError({ statusCode: 409, message: `Event "${body.slug}" already exists` });
  }

  const newEvent: Event = {
    slug: body.slug,
    name: body.name,
    published: body.published ?? false,
    title: body.title ?? '',
    start: body.start ?? '',
    deadline: body.deadline ?? '',
    visuals: body.visuals ?? { background: '', goal: '' },
    participants: body.participants ?? [],
  };

  writeEvent(newEvent.slug, newEvent);
  return newEvent;
});
