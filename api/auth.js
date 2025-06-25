const { AuthorizationCode } = require('simple-oauth2');

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

  const client = new authorizationCode(config);

  // We redirect the user to GitHub's authorization page
  const authorizationUri = client.authorizeURL({
    redirect_uri: `https://${req.headers.host}/api/callback`,
    scope: 'repo,user', // This scope allows Decap to read/write to the repo
    state: '3(#0/!~' // A random string to prevent CSRF attacks
  });

  res.writeHead(302, { Location: authorizationUri });
  res.end();
};