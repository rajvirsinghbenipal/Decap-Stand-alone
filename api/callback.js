const { AuthorizationCode } = require('simple-oauth2');

module.exports = async (req, res) => {
  console.log("--- /api/callback function started ---");

  const { code } = req.query;
  console.log("Received temporary code from GitHub:", code);

  if (!code) {
    console.error("Error: No temporary code received from GitHub.");
    return res.status(400).send("Missing authorization code from GitHub.");
  }

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

  const client = new AuthorizationCode(config);

  try {
    console.log("Attempting to exchange code for an access token...");
    const accessToken = await client.getToken({ code });
    const token = accessToken.token.access_token;
    
    console.log("Successfully received access token!");
    // For security, let's not log the token itself, just that we got it.

    const response = `
      <!DOCTYPE html><html><head><meta charset="utf-8"><title>Authorizing...</title></head><body>
      <script>
        console.log("Sending postMessage to opener window...");
        window.opener.postMessage('authorization:github:success:${JSON.stringify({
          token: token,
          provider: 'github'
        })}', '*')
        window.close()
      </script>
      </body></html>
    `;
    
    console.log("Sending final HTML response to the browser to close the popup.");
    res.status(200).send(response);
    console.log("--- /api/callback function finished successfully ---");

  } catch (error) {
    console.error("---!! ERROR in /api/callback !! ---");
    console.error("Failed to get access token:", error.message);
    // Log the full error context if available
    if (error.response) {
      console.error("Error Response Status:", error.response.status);
      console.error("Error Response Data:", error.response.data);
    }
    res.status(500).json({ error: 'Authentication failed during token exchange.' });
  }
};