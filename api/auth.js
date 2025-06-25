const { authorizationCode } = require('simple-oauth2');

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

module.exports = (req, res) => {
  const client = new authorizationCode(config);

  const authorizationUri = client.authorizeURL({
    redirect_uri: `https://YOUR_VERCEL_URL/api/callback`,
    scope: 'repo,user',
    state: '3(#0/!~'
  });

  res.writeHead(302, { Location: authorizationUri });
  res.end();
};