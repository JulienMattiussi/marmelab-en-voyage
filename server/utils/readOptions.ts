import type { H3Event } from 'h3';
import type { ReadOptions } from './storage/types';

// Public visitors may get a copy up to ~60s old from the CDN cache (cheaper);
// the logged-in admin always reads the latest version.
export const readOptionsFor = async (event: H3Event): Promise<ReadOptions> => ({
  cached: !(await getUserSession(event)).user,
});
