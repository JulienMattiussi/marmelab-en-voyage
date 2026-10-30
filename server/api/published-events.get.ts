import { listEvents } from '~/server/utils/events';

// Public list for the home page: drafts stay visible to the admin only (GET /api/events).
export default defineEventHandler(async () => {
  const events = await listEvents({ cached: true });
  return events.filter((e) => e.published);
});
