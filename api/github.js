const fetch = require('node-fetch');

// This is the correct proxy server code
module.exports = async (req, res) => {
  // The full GitHub API URL to call
  const githubUrl = `https://api.github.com${req.url.replace('/api/github', '')}`;

  try {
    const response = await fetch(githubUrl, {
      method: req.method,
      headers: {
        'Authorization': `token ${process.env.GITHUB_PAT}`, // Uses your secret PAT
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
      },
      // Pass along the body from the Decap CMS request if it exists
      body: req.method !== 'GET' && req.method !== 'HEAD' && req.body ? JSON.stringify(req.body) : undefined,
    });

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json();
        res.status(response.status).json(data);
    } else {
        const textData = await response.text();
        res.status(response.status).send(textData);
    }

  } catch (error) {
    console.error('Error in GitHub proxy:', error);
    res.status(500).json({ error: 'Failed to proxy request to GitHub' });
  }
};