import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import EditorForm from '../../components/EditorForm';
import { fields } from '../../config/fields';

export default function EditPage() {
  const router = useRouter();
  const { slug } = router.query;

  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [filePath, setFilePath] = useState('');

  useEffect(() => {
    if (!slug) return;

    const fetchEntry = async () => {
      try {
        const res = await fetch('/api/github', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'getEntry',
            params: {
              branch: 'main',
              path: `news/${slug}.md`,
            },
          }),
        });

        const entry = await res.json();
        const decoded = atob(entry.content);

        const frontmatter = extractFrontmatter(decoded);
        setForm(frontmatter);
        setFilePath(entry.path);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load entry:', err);
      }
    };

    fetchEntry();
  }, [slug]);

  const extractFrontmatter = (content) => {
    const match = /^---\n([\s\S]*?)\n---\n([\s\S]*)/.exec(content);
    if (!match) return {};

    const [, yaml, body] = match;
    const data = Object.fromEntries(
      yaml.split('\n').map((line) => {
        const [key, ...rest] = line.split(':');
        return [key.trim(), rest.join(':').trim()];
      })
    );

    data.body = body;
    return data;
  };

  const toFrontmatter = (data) => {
    const body = data.body || '';
    const front = { ...data };
    delete front.body;

    const yaml = Object.entries(front)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');

    return `---\n${yaml}\n---\n${body}`;
  };

  const save = async () => {
    const raw = toFrontmatter(form);

    try {
      const res = await fetch('/api/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'persistEntry',
          params: {
            branch: 'main',
            dataFiles: [
              {
                path: filePath,
                raw,
              },
            ],
            options: {
              commitMessage: `Update ${slug}`,
            },
          },
        }),
      });

      const result = await res.json();
      alert('Saved successfully!');
    } catch (err) {
      console.error('Failed to save entry:', err);
      alert('Save failed. See console for details.');
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Editing: {slug}</h1>
      <EditorForm formData={form} setFormData={setForm} onSave={save} />
    </div>
  );
}
