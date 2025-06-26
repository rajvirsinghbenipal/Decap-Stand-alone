export async function onRequest(context) {
  try {
    // Get the secret PAT from Cloudflare's environment variables
    const pat = context.env.GITHUB_PAT;
    if (!pat) {
      return new Response('GITHUB_PAT environment variable not set', { status: 500 });
    }

    // The magic happens here. We get the path parts from the URL.
    // For a request like /api/github/contents/_posts/..., this will be ['contents', '_posts', ...]
    const pathSegments = context.params.path || [];
    const githubPath = pathSegments.join('/');

    // Construct the correct, final GitHub API URL
    const githubUrl = `https://api.github.com/repos/rajvirsinghbenipal/hugo-content/${githubPath}`;

    // Forward the request to GitHub, adding our secret token
    const response = await fetch(githubUrl, {
      method: context.request.method,
      headers: {
        'Authorization': `token ${pat}`,
        'Content-Type': context.request.headers.get('Content-Type'),
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Cloudflare-Worker-Proxy'
      },
      body: context.request.method.toUpperCase() !== 'GET' ? await context.request.text() : undefined,
    });

    // Return GitHub's response directly to the browser
    return new Response(response.body, response);

  } catch (error) {
    return new Response(error.message, { status: 500 });
  }
}