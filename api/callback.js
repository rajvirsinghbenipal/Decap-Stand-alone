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

module.exports = async (req, res) => {
  const { code } = req.query;
  const options = {
    code,
  };
  const client = new authorizationCode(config);

  try {
    const accessToken = await client.getToken(options);
    const token = accessToken.token.access_token;

    const response = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Authorizing...</title>
      </head>
      <body>
        <script>
          window.opener.postMessage('authorization:github:success:${JSON.stringify({
            token: token,
            provider: 'github'
          })}', '*')
          window.close()
        </script>
      </body>
      </html>
    `;

    res.status(200).send(response);
  } catch (error) {
    console.error('Access Token Error', error.message);
    res.status(500).json('Authentication failed');
  }
};