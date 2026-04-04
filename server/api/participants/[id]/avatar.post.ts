import { readMultipartFormData } from 'h3';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { readParticipants, writeParticipants } from '~/server/utils/events';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, message: 'Missing id' });

  const participants = readParticipants();
  const participant = participants.find((p) => p.id === id);
  if (!participant) throw createError({ statusCode: 404, message: `Participant "${id}" not found` });

  const formData = await readMultipartFormData(event);
  const filePart = formData?.find((p) => p.name === 'file');

  if (!filePart?.data || !filePart.filename) {
    throw createError({ statusCode: 400, message: 'Missing file' });
  }

  const ext = extname(filePart.filename);
  const filename = `${id}${ext}`;
  const dir = join(process.cwd(), 'public', 'avatars');

  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, filename), filePart.data);

  const publicPath = `/avatars/${filename}`;
  participant.avatar = publicPath;
  writeParticipants(participants);

  return { path: publicPath };
});
