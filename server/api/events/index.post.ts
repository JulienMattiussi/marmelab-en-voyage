import { readEvent, writeEvent, listEvents } from '~/server/utils/events';
import { EVENT_LIMIT } from '~/utils/constants';
import type { TripEvent } from '~/types/event';

export default defineEventHandler(async (event) => {
  const body = await readBody<TripEvent>(event);

  if (!body?.slug || !body.name) {
    throw createError({ statusCode: 400, message: 'slug and name are required' });
  }

  if (readEvent(body.slug)) {
    throw createError({ statusCode: 409, message: `Event "${body.slug}" already exists` });
  }

  if (listEvents().length >= EVENT_LIMIT) {
    throw createError({ statusCode: 403, message: `La limite de ${EVENT_LIMIT} événements est atteinte. Supprimez un événement pour en créer un nouveau.` });
  }

  const newEvent: TripEvent = {
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
