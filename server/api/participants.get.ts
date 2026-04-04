import { readParticipants } from '~/server/utils/events';

export default defineEventHandler(() => {
  return readParticipants();
});
