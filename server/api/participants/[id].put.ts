import { readParticipants, writeParticipants } from '~/server/utils/events';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, message: 'Missing id' });

  const body = await readBody<{ name?: string; quote?: string; active?: boolean }>(event);

  const participants = readParticipants();
  const participant = participants.find((p) => p.id === id);
  if (!participant) throw createError({ statusCode: 404, message: `Participant "${id}" not found` });

  if (body.name !== undefined) participant.name = body.name.trim();
  if (body.quote !== undefined) participant.quote = body.quote;
  if (body.active !== undefined) participant.active = body.active;

  writeParticipants(participants);

  return participant;
});
