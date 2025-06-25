const { AuthorizationCode } = require('simple-oauth2'); // <-- FIX #1: Capital 'A'

// This is the function that starts the login process
module.exports = (req, res) => {
  const config = {
    client: {
      id: process.env.OAUTH_CLIENT_ID,
      secret: process.env.OAUTH_CLIENT_SECRET
    },
    auth: {
      tokenHost: 'https://github.com',
      tokenPath: '/login/oauth/access_token',
      authorizePath: '/login/oauth/authorize'
    }
  };

  const client = new AuthorizationCode(config); // <-- FIX #2: Capital 'A'

  // We redirect the user to GitHub's authorization page
  const authorizationUri = client.authorizeURL({
    redirect_uri: `https://punjabi-news-admin.vercel.app/api/callback`,
    scope: 'repo,user',
    state: '3(#0/!~'
  });

  res.writeHead(302, { Location: authorizationUri });
  res.end();
};