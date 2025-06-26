const fetch = require('node-fetch');

// This function is our secure proxy
export default async function handler(req, res) {
  // The path of the GitHub API endpoint to call
  // e.g., /repos/user/repo/contents/path/to/file.md
  const githubUrl = `https://api.github.com${req.url.replace('/api/github', '')}`;

  try {
    const response = await fetch(githubUrl, {
      method: req.method,
      headers: {
        // Add the secret PAT from our environment variables
        'Authorization': `token ${process.env.GITHUB_PAT}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
      },
      // Pass along the body from the Decap CMS request
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();

    // Send GitHub's response back to the Decap CMS client
    res.status(response.status).json(data);

  } catch (error) {
    console.error('Error in GitHub proxy:', error);
    res.status(500).json({ error: 'Failed to proxy request to GitHub' });
  }
}