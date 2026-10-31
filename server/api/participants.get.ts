import { readParticipants } from '~/server/utils/events';
import { readOptionsFor } from '~/server/utils/readOptions';

export default defineEventHandler(async (event) => {
  const options = await readOptionsFor(event);
  const participants = await readParticipants(options);
  // The avatar source link is only used by the admin editor: public visitors don't get it.
  if (!options.cached) return participants;
  return participants.map(({ avatarSource: _, ...participant }) => participant);
});
