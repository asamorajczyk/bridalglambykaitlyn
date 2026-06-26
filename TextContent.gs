// ── READ: called by doGet when action=text ────────────────────────────────
function getTextContent() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Text Content');
  if (!sheet) {
    return ContentService.createTextOutput('{}')
      .setMimeType(ContentService.MimeType.JSON);
  }

  const data   = sheet.getDataRange().getValues();
  const result = {};
  data.forEach(([key, content]) => {
    const k = String(key).trim();
    // skip blank rows and section-header rows (key starts with #)
    if (k && !k.startsWith('#')) result[k] = String(content);
  });

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── SETUP: run once to create the "Text Content" sheet ───────────────────
// In the Apps Script editor: select setupTextContent from the dropdown → Run
function setupTextContent() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const existing = ss.getSheetByName('Text Content');
  if (existing) ss.deleteSheet(existing);
  const sheet = ss.insertSheet('Text Content');

  // ── HEADERS ──────────────────────────────────────────────────────
  const headers = ['Key', 'Content', 'Where it appears on the site'];
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers])
    .setBackground('#8b4c5e')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setFontSize(11)
    .setVerticalAlignment('middle');
  sheet.setRowHeight(1, 38);
  sheet.setFrozenRows(1);

  // ── ROWS: [key, content, description] ────────────────────────────
  // Keys starting with # are section headers — the website ignores them.
  const rows = [
    // ── HOME PAGE ──
    ['# HOME PAGE', '', ''],
    ['home_hero_script',     'Making you feel',
      'Homepage · italic cursive line above the main headline'],
    ['home_hero_body',       'Hair and makeup artistry for your most unforgettable moments — weddings, prom, and every celebration in between.',
      'Homepage · paragraph beneath "Beautifully Yourself"'],
    ['home_about_headline',  'Your Hair & Makeup Artist, All in One',
      'Homepage · heading in the "Meet Kaitlyn" about strip'],
    ['home_about_body_1',    'Hi, I\'m Kaitlyn! I\'m a bridal hairstylist and makeup artist based in Northern Colorado, passionate about helping every client feel their most confident and beautiful on their biggest day.',
      'Homepage · first paragraph in the about strip'],
    ['home_about_body_2',    'From ethereal bridal looks to bold prom glam, I bring a personalized touch to every appointment — because your look should feel like you, just elevated.',
      'Homepage · second paragraph in the about strip'],
    // ── TESTIMONIALS ──
    ['# TESTIMONIALS', '', ''],
    ['testimonial_1_text',   '"Kaitlyn made me feel so beautiful on my wedding day. She listened to exactly what I wanted and delivered beyond my expectations. Highly recommend!"',
      'Homepage · first review — the quote text (keep the " " marks)'],
    ['testimonial_1_author', '— Bridal Client',
      'Homepage · first review — name or label beneath the quote'],
    ['testimonial_2_text',   '"She did my hair and makeup for prom and I\'ve never felt more confident. Everyone was asking who did my look all night!"',
      'Homepage · second review — the quote text'],
    ['testimonial_2_author', '— Prom Client',
      'Homepage · second review — name or label'],
    ['testimonial_3_text',   '"So talented and so easy to work with. Kaitlyn kept the whole bridal party calm and gorgeous. We\'ll be booking her for every event."',
      'Homepage · third review — the quote text'],
    ['testimonial_3_author', '— Bridal Party Client',
      'Homepage · third review — name or label'],
    // ── ABOUT PAGE ──
    ['# ABOUT PAGE', '', ''],
    ['about_quote',          '"I\'m so happy you\'re here. Feel free to reach out with any questions."',
      'About page · sidebar blockquote beside Kaitlyn\'s photo'],
    ['about_bio_p1',         'Hi, I\'m Kaitlyn — a bridal hairstylist and makeup artist based in Northern Colorado. I started Bridal Glam by Kaitlyn because I believe every person deserves to feel truly beautiful on the moments that matter most.',
      'About page · bio paragraph 1'],
    ['about_bio_p2',         'What sets me apart? I do hair and makeup, which means you get a cohesive look from one artist who knows exactly how your full look is coming together — without coordinating between two different people on your big day.',
      'About page · bio paragraph 2'],
    ['about_bio_p3',         'I specialize in weddings, prom, and special events across the Loveland, Fort Collins, Greeley, and Kersey areas. Whether you want something soft and romantic or bold and editorial, I\'ll work with you to create a look that feels authentically you.',
      'About page · bio paragraph 3'],
    ['about_bio_p4',         'With a 100% recommendation rate from all my clients, my goal is simple: show up, make you feel incredible, and give you memories you\'ll love looking back on.',
      'About page · bio paragraph 4'],
    ['about_story_answer',   '✨ Me on my wedding day ✨',
      'About page · the bold fun line in the story callout box'],
    ['about_story_caption',  'Yes — that\'s really me, doing hair for others on my own wedding day. That\'s how much I love this.',
      'About page · the smaller caption line in the story callout box'],
  ];

  // ── WRITE ROWS ───────────────────────────────────────────────────
  rows.forEach((row, i) => {
    const r = i + 2;
    sheet.getRange(r, 1).setValue(row[0]);
    sheet.getRange(r, 2).setValue(row[1]);
    sheet.getRange(r, 3).setValue(row[2]);
  });

  // ── COLOR SECTION HEADERS ────────────────────────────────────────
  rows.forEach((row, i) => {
    const r = i + 2;
    if (String(row[0]).startsWith('#')) {
      sheet.getRange(r, 1, 1, headers.length)
        .setBackground('#8b4c5e')
        .setFontColor('#ffffff')
        .setFontWeight('bold')
        .setFontSize(10);
      sheet.setRowHeight(r, 28);
    } else {
      sheet.getRange(r, 1, 1, headers.length)
        .setBackground('#fdf5f6')
        .setVerticalAlignment('middle');
      sheet.setRowHeight(r, 44);
    }
  });

  // ── BOLD THE KEYS, STYLE THE DESCRIPTIONS ────────────────────────
  rows.forEach((row, i) => {
    if (String(row[0]).startsWith('#')) return;
    const r = i + 2;
    sheet.getRange(r, 1).setFontFamily('Courier New').setFontColor('#8b4c5e');
    sheet.getRange(r, 3).setFontColor('#888888').setFontStyle('italic').setFontSize(9);
  });

  // ── COLUMN WIDTHS ────────────────────────────────────────────────
  sheet.setColumnWidth(1, 200);
  sheet.setColumnWidth(2, 480);
  sheet.setColumnWidth(3, 300);

  // ── WRAP TEXT ────────────────────────────────────────────────────
  sheet.getRange(1, 1, rows.length + 1, headers.length).setWrap(true);

  // ── INSTRUCTIONS BOX ─────────────────────────────────────────────
  const instrRow = rows.length + 3;
  sheet.getRange(instrRow, 1, 1, headers.length)
    .merge()
    .setValue(
      'HOW TO USE: Edit anything in the "Content" column (column B) and save — the website picks it up automatically within a minute or two.\n\n' +
      'TIPS: Keep punctuation as-is (the " " marks on reviews, the — dashes, etc.). ' +
      'Rows with a key starting with # are section labels only — the website never reads them. ' +
      'Do not change anything in the "Key" column or the website will stop finding that text.'
    )
    .setBackground('#f5e6e8')
    .setFontColor('#8b4c5e')
    .setFontStyle('italic')
    .setFontSize(9)
    .setWrap(true)
    .setVerticalAlignment('top');
  sheet.setRowHeight(instrRow, 90);

  SpreadsheetApp.getUi().alert('Done! "Text Content" tab created. You can now edit column B to update text on the site.');
}
