export default oauthGitHubEventHandler({
  config: {
    emailRequired: true
  },
  async onSuccess(event, { user, tokens }) {
    await setUserSession(event, {
      user: {
        githubId: user.id,
        login: user.login,
        name: user.name,
        email: user.email
      }
    });
    return sendRedirect(event, '/');
  },
  onError(event, error) {
    console.error('GitHub OAuth error:', error);
    return sendRedirect(event, '/login');
  }
});