import { listEvents } from '~/server/utils/events';

export default defineEventHandler(() => {
  return listEvents();
});
