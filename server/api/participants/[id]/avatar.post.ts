import { readMultipartFormData } from 'h3';
import { extname } from 'node:path';
import { readParticipants, writeParticipants } from '~/server/utils/events';
import { getStorage } from '~/server/utils/storage';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, message: 'Missing id' });

  const participants = await readParticipants();
  const participant = participants.find((p) => p.id === id);
  if (!participant) throw createError({ statusCode: 404, message: `Participant "${id}" not found` });

  const formData = await readMultipartFormData(event);
  const filePart = formData?.find((p) => p.name === 'file');

  if (!filePart?.data || !filePart.filename) {
    throw createError({ statusCode: 400, message: 'Missing file' });
  }

  const ext = extname(filePart.filename);
  const contentType = filePart.type ?? 'image/png';
  const storage = await getStorage();
  const url = await storage.putAsset(`avatars/${id}${ext}`, filePart.data, contentType);

  participant.avatar = url;
  await writeParticipants(participants);

  return { path: url };
});
