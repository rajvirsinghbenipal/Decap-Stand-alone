const { AuthorizationCode } = require('simple-oauth2');

// This is the function that GitHub calls back to after the user logs in
module.exports = async (req, res) => {
  const { code } = req.query;
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

  try {
    // We exchange the temporary code for a permanent access token
    const accessToken = await client.getToken({ code });
    const token = accessToken.token.access_token;

    // This HTML and script sends the token back to the Decap CMS window
    const response = `
      <!DOCTYPE html><html><head><meta charset="utf-8"><title>Authorizing...</title></head><body>
      <script>
        window.opener.postMessage('authorization:github:success:${JSON.stringify({
          token: token,
          provider: 'github'
        })}', '*')
        window.close()
      </script>
      </body></html>
    `;

    res.status(200).send(response);
  } catch (error) {
    console.error('Access Token Error', error.message);
    res.status(500).json('Authentication failed');
  }
};