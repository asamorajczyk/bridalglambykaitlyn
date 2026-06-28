const CONTENT_PATH = 'content/site.json';

export async function onRequestGet(context) {
  const { env } = context;
  try {
    const file = await ghGet(env, CONTENT_PATH);
    const text = atob(file.content.replace(/\n/g, ''));
    return json({ content: JSON.parse(text), sha: file.sha });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}

export async function onRequestPut(context) {
  const { request, env } = context;
  try {
    const { content, sha } = await request.json();
    await ghPut(env, CONTENT_PATH, JSON.stringify(content, null, 2), sha, 'Update site content');
    return json({ success: true });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}

async function ghGet(env, path) {
  const res = await fetch(
    `https://api.github.com/repos/${env.GITHUB_REPO}/contents/${path}`,
    { headers: ghHeaders(env) }
  );
  if (!res.ok) throw new Error(`GitHub ${res.status}: could not read ${path}`);
  return res.json();
}

async function ghPut(env, path, content, sha, message) {
  // btoa with unicode support
  const encoded = btoa(unescape(encodeURIComponent(content)));
  const body = { message, content: encoded, sha };
  const res = await fetch(
    `https://api.github.com/repos/${env.GITHUB_REPO}/contents/${path}`,
    {
      method:  'PUT',
      headers: { ...ghHeaders(env), 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `GitHub ${res.status}`);
  }
  return res.json();
}

function ghHeaders(env) {
  return {
    'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
    'Accept':        'application/vnd.github+json',
    'User-Agent':    'BridalGlamAdmin/1.0',
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
