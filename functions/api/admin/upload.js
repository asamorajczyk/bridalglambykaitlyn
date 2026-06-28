const ALLOWED_SLOTS = ['hero', 'about-strip', 'about-portrait', 'service-bridal',
                       'service-party', 'service-prom', 'service-events', 'logo'];
const ALLOWED_EXTS  = ['jpg', 'jpeg', 'png', 'webp'];

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const slot = formData.get('slot');

    if (!file || !slot)              return json({ error: 'Missing file or slot' }, 400);
    if (!ALLOWED_SLOTS.includes(slot)) return json({ error: 'Invalid photo slot' }, 400);

    const ext = file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTS.includes(ext)) return json({ error: 'Use JPG, PNG, or WebP files only' }, 400);

    // Size limit: 8 MB
    if (file.size > 8 * 1024 * 1024) return json({ error: 'File too large (max 8 MB)' }, 400);

    const path = `images/uploads/${slot}.${ext}`;

    // Base64 encode the image
    const bytes   = new Uint8Array(await file.arrayBuffer());
    let   binary  = '';
    bytes.forEach(b => { binary += String.fromCharCode(b); });
    const encoded = btoa(binary);

    // Get current SHA if file exists (needed for updates)
    let sha;
    try {
      const existing = await fetch(
        `https://api.github.com/repos/${env.GITHUB_REPO}/contents/${path}`,
        { headers: ghHeaders(env) }
      );
      if (existing.ok) sha = (await existing.json()).sha;
    } catch {}

    const body = { message: `Upload ${slot} photo`, content: encoded };
    if (sha) body.sha = sha;

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

    return json({ success: true, path: `/${path}` });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
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
