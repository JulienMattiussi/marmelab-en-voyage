import { readParticipants } from '~/server/utils/events';
import { readOptionsFor } from '~/server/utils/readOptions';

export default defineEventHandler(async (event) => {
  return readParticipants(await readOptionsFor(event));
});
