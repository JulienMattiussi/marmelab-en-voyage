export default defineOAuthGitHubEventHandler({
  async onSuccess(event, { user }) {
    const allowedLogin = process.env.GITHUB_ALLOWED_LOGIN;

    if (!allowedLogin || user.login !== allowedLogin) {
      throw createError({ statusCode: 403, message: 'Access denied' });
    }

    await setUserSession(event, {
      user: { login: user.login, avatar: user.avatar_url },
    });

    return sendRedirect(event, '/admin');
  },

  onError(event, error) {
    console.error('GitHub OAuth error:', error);
    return sendRedirect(event, '/login?error=oauth');
  },
});
