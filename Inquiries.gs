function doPost(e) {
  try {
    const p = e.parameter;

    // Write to sheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheets()[0];
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp','Name','Email','Phone','Event Date','Service','Location','Message']);
    }
    sheet.appendRow([
      new Date(),
      p.name || '', p.email || '', p.phone || '',
      p.date || '', p.service || '', p.location || '',
      p.message || ''
    ]);

    const sheetUrl = ss.getUrl();

    // Email Kaitlyn
    MailApp.sendEmail({
      to: 'bridalbykaitlyn@outlook.com',
      subject: `✨ New Inquiry: ${p.name} — ${p.service}`,
      body:
        `New booking inquiry received!\n\n` +
        `Name: ${p.name}\n` +
        `Email: ${p.email}\n` +
        `Phone: ${p.phone || 'Not provided'}\n` +
        `Event Date: ${p.date || 'Not provided'}\n` +
        `Service: ${p.service}\n` +
        `Location: ${p.location || 'Not provided'}\n\n` +
        `Message:\n${p.message || 'None'}\n\n` +
        `View all inquiries: ${sheetUrl}`,
      htmlBody: `
        <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #3a3a3a;">
          <div style="background: #f5e6e8; padding: 28px 32px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 22px; color: #8b4c5e; letter-spacing: 1px;">✨ New Booking Inquiry</h1>
          </div>
          <div style="background: #ffffff; padding: 28px 32px; border-radius: 0 0 12px 12px; border: 1px solid #e8d0d4;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 6px; font-weight: bold; color: #8b4c5e; width: 35%;">Name</td>
                <td style="padding: 8px 6px;">${p.name}</td>
              </tr>
              <tr style="background: #fdf5f6;">
                <td style="padding: 8px 6px; font-weight: bold; color: #8b4c5e;">Email</td>
                <td style="padding: 8px 6px;"><a href="mailto:${p.email}" style="color: #8b4c5e;">${p.email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 6px; font-weight: bold; color: #8b4c5e;">Phone</td>
                <td style="padding: 8px 6px;">${p.phone || '<em style="color:#aaa">Not provided</em>'}</td>
              </tr>
              <tr style="background: #fdf5f6;">
                <td style="padding: 8px 6px; font-weight: bold; color: #8b4c5e;">Event Date</td>
                <td style="padding: 8px 6px;">${p.date || '<em style="color:#aaa">Not provided</em>'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 6px; font-weight: bold; color: #8b4c5e;">Service</td>
                <td style="padding: 8px 6px;">${p.service}</td>
              </tr>
              <tr style="background: #fdf5f6;">
                <td style="padding: 8px 6px; font-weight: bold; color: #8b4c5e;">Location</td>
                <td style="padding: 8px 6px;">${p.location || '<em style="color:#aaa">Not provided</em>'}</td>
              </tr>
            </table>

            ${p.message ? `
            <div style="margin-top: 20px; padding: 16px; background: #fdf5f6; border-left: 3px solid #c9848f; border-radius: 4px;">
              <p style="margin: 0 0 6px; font-weight: bold; color: #8b4c5e;">Message</p>
              <p style="margin: 0; line-height: 1.6;">${p.message}</p>
            </div>` : ''}

            <div style="margin-top: 24px; text-align: center;">
              <a href="${sheetUrl}" style="display: inline-block; background: #8b4c5e; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-size: 14px; letter-spacing: 0.5px;">View All Inquiries →</a>
            </div>
          </div>
          <p style="text-align: center; font-size: 12px; color: #b0b0b0; margin-top: 16px;">Bridal Glam by Kaitlyn</p>
        </div>
      `
    });

    return ContentService.createTextOutput('OK');
  } catch(err) {
    return ContentService.createTextOutput('Error: ' + err.message);
  }
}

function doGet(e) {
  const action = e?.parameter?.action;

  if (action === 'refs') {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Photo References');
    const data = sheet ? sheet.getDataRange().getValues() : [];

    const keyMap = {
      'Hero Background':          'home_hero',
      'About Strip Photo':        'home_strip',
      'Portrait Photo':           'about_portrait',
      'Bridal Section':           'services_bridal',
      'Bridal Party Section':     'services_party',
      'Prom Section':             'services_prom',
      'Special Events Section':   'services_events',
    };

    const refs = {};
    for (let i = 1; i < data.length; i++) {
      const section  = data[i][1];
      const fileName = String(data[i][4] || '').trim();
      const key = keyMap[section];
      if (key && fileName) refs[key] = fileName;
    }

    return ContentService.createTextOutput(JSON.stringify(refs))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'text') {
    return getTextContent();
  }

  return ContentService.createTextOutput('{}')
    .setMimeType(ContentService.MimeType.JSON);
}
