// Test-only endpoint to create an authenticated session without going through OAuth.
// Only available in test/development environments.
export default defineEventHandler(async (event) => {
  if (process.env.NODE_ENV === 'production') {
    throw createError({ statusCode: 404 });
  }

  await setUserSession(event, {
    user: { login: process.env.GITHUB_ALLOWED_LOGIN ?? 'test-user', avatar: '' },
  });

  return { ok: true };
});
