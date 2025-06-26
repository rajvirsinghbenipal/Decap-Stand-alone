const fetch = require('node-fetch');

// This is the final, corrected proxy server code.
module.exports = async (req, res) => {
  // This part gets the path the CMS wants to access.
  let githubPath = req.url.replace('/api/github', '');

  // THIS IS THE FIX: If the path is just a slash, we make it an empty string
  // to avoid a trailing slash on the final URL, which GitHub's API rejects.
  if (githubPath === '/') {
    githubPath = '';
  }

  const githubUrl = `https://api.github.com/repos/rajvirsinghbenipal/hugo-content${githubPath}`;
  
  try {
    const response = await fetch(githubUrl, {
      method: req.method,
      headers: {
        'Authorization': `token ${process.env.GITHUB_PAT}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
      },
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