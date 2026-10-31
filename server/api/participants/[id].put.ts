import { readParticipants, writeParticipants } from '~/server/utils/events';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, message: 'Missing id' });

  const body = await readBody<{ name?: string; quote?: string; active?: boolean; avatarSource?: string }>(event);

  const participants = await readParticipants();
  const participant = participants.find((p) => p.id === id);
  if (!participant) throw createError({ statusCode: 404, message: `Participant "${id}" not found` });

  if (body.name !== undefined) participant.name = body.name.trim();
  if (body.quote !== undefined) participant.quote = body.quote;
  if (body.active !== undefined) participant.active = body.active;
  if (body.avatarSource !== undefined) {
    const source = body.avatarSource.trim();
    // Only web links: the admin opens this URL in a new tab.
    if (source && !/^https?:\/\//.test(source)) {
      throw createError({ statusCode: 400, message: 'Le lien source doit commencer par http:// ou https://' });
    }
    if (source) participant.avatarSource = source;
    else delete participant.avatarSource;
  }

  await writeParticipants(participants);

  return participant;
});
