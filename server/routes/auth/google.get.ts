export default oauthGoogleEventHandler({
  config: {
    emailRequired: true
  },
  async onSuccess(event, { user, tokens }) {
    await setUserSession(event, {
      user: {
        googleId: user.id,
        email: user.email,
        name: user.name
      }
    });
    return sendRedirect(event, '/');
  },
  onError(event, error) {
    console.error('Google OAuth error:', error);
    return sendRedirect(event, '/login');
  }
});