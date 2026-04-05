import config from '~/server/utils/config';

// Test-only endpoint to create an authenticated session without going through OAuth.
// Only available in test/development environments.
export default defineEventHandler(async (event) => {
  if (config.get('env') === 'production') {
    throw createError({ statusCode: 404 });
  }

  await setUserSession(event, {
    user: { login: config.get('githubAllowedLogin') || 'test-user', avatar: '' },
  });

  return { ok: true };
});
