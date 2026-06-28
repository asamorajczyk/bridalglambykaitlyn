export async function onRequestGet(context) {
  const { env } = context;

  if (!env.AIRTABLE_TOKEN || !env.AIRTABLE_BASE_ID) {
    return json({ error: 'Airtable not configured' }, 500);
  }

  try {
    const url = new URL(`https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/Inquiries`);
    url.searchParams.set('sort[0][field]',     'Submitted');
    url.searchParams.set('sort[0][direction]', 'desc');
    url.searchParams.set('pageSize',           '100');

    const res = await fetch(url.toString(), {
      headers: { 'Authorization': `Bearer ${env.AIRTABLE_TOKEN}` },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return json({ error: err.error?.message || `Airtable error ${res.status}` }, 500);
    }

    const { records } = await res.json();
    const inquiries = (records || []).map(r => ({
      id:        r.id,
      name:      r.fields['Name']        || '',
      email:     r.fields['Email']       || '',
      phone:     r.fields['Phone']       || '',
      eventDate: r.fields['Event Date']  || '',
      service:   r.fields['Service']     || '',
      location:  r.fields['Location']    || '',
      message:   r.fields['Message']     || '',
      status:    r.fields['Status']      || 'Received',
      submitted: r.fields['Submitted']   || r.createdTime,
    }));

    return json({ inquiries });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}

export async function onRequestPatch(context) {
  const { request, env } = context;

  if (!env.AIRTABLE_TOKEN || !env.AIRTABLE_BASE_ID) {
    return json({ error: 'Airtable not configured' }, 500);
  }

  try {
    const { id, status } = await request.json();
    if (!id || !status) return json({ error: 'Missing id or status' }, 400);

    const res = await fetch(
      `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/Inquiries/${id}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${env.AIRTABLE_TOKEN}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({ fields: { Status: status } }),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return json({ error: err.error?.message || `Airtable error ${res.status}` }, 500);
    }

    return json({ success: true });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
