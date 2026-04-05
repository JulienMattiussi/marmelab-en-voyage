import { test as base, request } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use) => {
    // Obtain a session cookie via the test-only login endpoint.
    const ctx = await request.newContext({ baseURL: 'http://localhost:3000' });
    await ctx.post('/api/__test-login');
    const cookies = await ctx.storageState();
    await page.context().addCookies(cookies.cookies);
    await ctx.dispose();
    await use(page);
  },
});

export { expect } from '@playwright/test';
