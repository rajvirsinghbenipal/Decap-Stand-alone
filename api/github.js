const fetch = require('node-fetch');

// This function is our secure proxy
// We are changing "export default async function handler" to "module.exports"
module.exports = async (req, res) => {
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
      // Pass along the body from the Decap CMS request if it exists
      body: req.method !== 'GET' && req.method !== 'HEAD' && req.body ? JSON.stringify(req.body) : undefined,
    });
    
    // Check if the response from GitHub has content
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json();
        res.status(response.status).json(data);
    } else {
        // If not JSON, send it back as text. This handles things like file deletions.
        const textData = await response.text();
        res.status(response.status).send(textData);
    }

  } catch (error) {
    console.error('Error in GitHub proxy:', error);
    res.status(500).json({ error: 'Failed to proxy request to GitHub' });
  }
};