export async function onRequestPost(context) {
  const { request, env } = context;

  let data;
  try {
    const f = await request.formData();
    data = {
      Name:          f.get('name')     || '',
      Email:         f.get('email')    || '',
      Phone:         f.get('phone')    || '',
      'Event Date':  f.get('date')     || '',
      Service:       f.get('service')  || '',
      Location:      f.get('location') || '',
      Message:       f.get('message')  || '',
    };
  } catch {
    return json({ error: 'Invalid form data' }, 400);
  }

  // Store in Airtable
  try {
    await fetch(`https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/Inquiries`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.AIRTABLE_TOKEN}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({ fields: data }),
    });
  } catch (e) {
    console.error('Airtable error:', e);
  }

  // Email notification via Resend
  if (env.RESEND_API_KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({
          from:    `Bridal Glam Website <noreply@${env.SITE_DOMAIN || 'bridalglambykaitlyn.com'}>`,
          to:      ['bridalbykaitlyn@outlook.com'],
          subject: `New Inquiry from ${data.Name}`,
          html:    buildEmailHtml(data, env),
        }),
      });
    } catch (e) {
      console.error('Resend error:', e);
    }
  }

  return json({ success: true });
}

const SERVICE_LABELS = {
  'bridal-full':   'Bridal Hair + Makeup (Full Package)',
  'bridal-hair':   'Bridal Hair Only',
  'bridal-makeup': 'Bridal Makeup Only',
  'bridal-party':  'Bridal Party (Group)',
  'prom':          'Prom / Formal Event',
  'special':       'Special Occasion',
  'other':         'Other / Not Sure Yet',
};

function buildEmailHtml(d, env) {
  const domain = env.SITE_DOMAIN || 'bridalglambykaitlyn.com';
  const row = (label, val) =>
    `<tr><td style="padding:8px 0;color:#888;width:120px;vertical-align:top;">${label}</td>
         <td style="padding:8px 0;">${esc(val || '—')}</td></tr>`;
  return `
    <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#333;">
      <div style="background:#b07080;padding:24px 32px;">
        <h2 style="color:white;margin:0;font-size:1.2rem;font-weight:normal;letter-spacing:0.05em;">
          NEW INQUIRY — Bridal Glam by Kaitlyn
        </h2>
      </div>
      <div style="padding:32px;">
        <table style="width:100%;border-collapse:collapse;">
          ${row('Name',       d.Name)}
          ${row('Email',      `<a href="mailto:${esc(d.Email)}" style="color:#b07080;">${esc(d.Email)}</a>`)}
          ${row('Phone',      d.Phone)}
          ${row('Event Date', d['Event Date'])}
          ${row('Service',    SERVICE_LABELS[d.Service] || d.Service)}
          ${row('Location',   d.Location)}
        </table>
        <div style="margin-top:24px;padding:20px;background:#fdf5f5;border-left:3px solid #b07080;">
          <p style="margin:0 0 8px;font-size:0.8rem;color:#888;text-transform:uppercase;letter-spacing:0.1em;">Message</p>
          <p style="margin:0;line-height:1.7;">${esc(d.Message).replace(/\n/g, '<br>')}</p>
        </div>
        <p style="margin-top:32px;font-size:0.8rem;color:#aaa;">
          View all inquiries at your
          <a href="https://${domain}/admin" style="color:#b07080;">admin panel</a>.
        </p>
      </div>
    </div>`;
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, c =>
    ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])
  );
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}
