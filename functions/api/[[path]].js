// This is the Cloudflare Worker version of our proxy.
export async function onRequest(context) {
  try {
    // Get the original request URL
    const url = new URL(context.request.url);

    // Construct the path to the GitHub API
    // It takes the path after `/api/` from the incoming request
    const githubPath = url.pathname.replace('/api/', '');
    const githubUrl = `https://api.github.com/repos/rajvirsinghbenipal/hugo-content/${githubPath}`;

    // Get the secret PAT from Cloudflare's environment variables
    const pat = context.env.GITHUB_PAT;

    if (!pat) {
      return new Response('GITHUB_PAT environment variable not set', { status: 500 });
    }

    // Forward the request to GitHub, adding our secret token
    const response = await fetch(githubUrl, {
      method: context.request.method,
      headers: {
        'Authorization': `token ${pat}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Cloudflare-Worker-Proxy' // GitHub API requires a User-Agent
      },
      body: context.request.method !== 'GET' && context.request.method !== 'HEAD' ? context.request.body : undefined,
    });

    // Return GitHub's response directly to the browser
    return new Response(response.body, response);

  } catch (error) {
    return new Response(error.message, { status: 500 });
  }
}