import { readParticipants, writeParticipants } from '~/server/utils/events';
import type { GlobalParticipant } from '~/types/event';

export default defineEventHandler(async (event) => {
  const body = await readBody<{ name: string; quote?: string }>(event);

  if (!body?.name?.trim()) {
    throw createError({ statusCode: 400, message: 'name is required' });
  }

  const id = body.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '')
    .replace(/(^-|-$)/g, '');

  const participants = readParticipants();

  if (participants.some((p) => p.id === id)) {
    throw createError({ statusCode: 409, message: `Un participant avec l'identifiant "${id}" existe déjà` });
  }

  const newParticipant: GlobalParticipant = {
    id,
    name: body.name.trim(),
    avatar: `/avatars/${id}.png`,
    quote: body.quote?.trim() ?? '',
    active: true,
  };

  participants.push(newParticipant);
  writeParticipants(participants);

  return newParticipant;
});
