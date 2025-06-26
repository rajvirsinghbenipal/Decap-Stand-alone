// This is the final, corrected Cloudflare Worker proxy code.
export async function onRequest(context) {
  try {
    // Get the secret PAT from Cloudflare's environment variables
    const pat = context.env.GITHUB_PAT;
    if (!pat) {
      return new Response('GITHUB_PAT environment variable not set', { status: 500 });
    }

    // --- THIS IS THE CORRECTED LOGIC ---
    // Get all parts of the path from the incoming request
    // e.g., for /api/github/contents/_posts, this will be ['github', 'contents', '_posts']
    const pathSegments = context.params.path || [];

    // The real GitHub path is everything *after* the 'github' part
    const githubPathSegments = pathSegments.slice(1);
    let githubPath = githubPathSegments.join('/');

    // Add a leading slash only if there is a path
    if (githubPath) {
      githubPath = '/' + githubPath;
    }
    // --- END OF CORRECTED LOGIC ---

    // Construct the correct, final GitHub API URL
    const githubUrl = `https://api.github.com/repos/rajvirsinghbenipal/hugo-content${githubPath}`;

    // Forward the request to GitHub, adding our secret token
    const response = await fetch(githubUrl, {
      method: context.request.method,
      headers: {
        'Authorization': `token ${pat}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Cloudflare-Worker-Proxy'
      },
      body: context.request.method.toUpperCase() !== 'GET' ? context.request.body : undefined,
    });

    // Return GitHub's response directly to the browser
    return new Response(response.body, response);

  } catch (error) {
    return new Response(error.message, { status: 500 });
  }
}