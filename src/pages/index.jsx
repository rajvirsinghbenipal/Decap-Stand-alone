import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch('/api/github', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'entriesByFolder',
        params: {
          branch: 'main',
          folder: 'news',
          extension: 'md',
          depth: 1
        }
      })
    })
    .then(res => res.json())
    .then(setPosts);
  }, []);

  return (
    <div>
      <h1>Blog Entries</h1>
      <ul>
        {posts.map(post => (
          <li key={post.slug}>
            <Link href={`/edit/${post.slug}`}>{post.slug}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
