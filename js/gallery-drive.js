// Google Drive Gallery Loader
// ─────────────────────────────────────────────────────────────────────────────
// How Kaitlyn adds photos:
//   • Drop any image into the Drive folder → shows in Gallery under "All"
//   • Drop into a subfolder named exactly "Bridal", "Prom", "Hair", or "Makeup"
//     → shows under that filter tab automatically
// ─────────────────────────────────────────────────────────────────────────────

const DRIVE_FOLDER_ID = '1HN4VzqxJTIZ1tuMan-tE1dPND9Jpa5oo'; // Gallery folder
const API_KEY = 'AIzaSyAiC_UjUdzU52KA888sUhteJHJemBZGqUU';

const SUBFOLDER_TAGS = { Bridal: 'bridal', Prom: 'prom', Hair: 'hair', Makeup: 'makeup' };

function scaleThumb(thumbnailLink, size) {
  return thumbnailLink.replace(/=s\d+$/, `=s${size}`);
}

async function listFiles(parentId) {
  const q = encodeURIComponent(`'${parentId}' in parents and trashed = false`);
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,mimeType,thumbnailLink)&pageSize=200&key=${API_KEY}`
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error?.message || `HTTP ${res.status}`);
  }
  return (await res.json()).files || [];
}

async function loadGallery() {
  const gallery = document.getElementById('gallery');
  gallery.innerHTML = '<p style="text-align:center;padding:80px 24px;color:#aaa;font-size:0.9rem;">Loading gallery…</p>';

  try {
    const all = await listFiles(DRIVE_FOLDER_ID);
    const subfolders = all.filter(f => f.mimeType === 'application/vnd.google-apps.folder');
    const rootImages  = all.filter(f => f.mimeType.startsWith('image/') && f.thumbnailLink);

    const items = rootImages.map(f => ({ name: f.name, thumb: f.thumbnailLink, tag: 'all' }));

    for (const folder of subfolders) {
      const tag = SUBFOLDER_TAGS[folder.name];
      if (!tag) continue;
      const imgs = await listFiles(folder.id);
      imgs.filter(f => f.mimeType.startsWith('image/') && f.thumbnailLink).forEach(f => {
        items.push({ name: f.name, thumb: f.thumbnailLink, tag });
      });
    }

    if (items.length === 0) {
      gallery.innerHTML = '<p style="text-align:center;padding:80px 24px;color:#aaa;">No photos yet — upload some to the Drive folder!</p>';
      return;
    }

    gallery.innerHTML = '';
    items.forEach(({ name, thumb, tag }) => {
      const div = document.createElement('div');
      div.className = 'gallery-full-item';
      div.dataset.filter = tag;
      div.dataset.src = scaleThumb(thumb, 1600);
      const labelText = tag !== 'all' ? tag.charAt(0).toUpperCase() + tag.slice(1) : '';
      div.innerHTML = `
        <img src="${scaleThumb(thumb, 800)}" alt="${name}" loading="lazy" />
        ${labelText ? `<div class="gallery-label"><span>${labelText}</span></div>` : ''}
      `;
      gallery.appendChild(div);
    });

    wireControls();
  } catch (err) {
    console.error(err);
    gallery.innerHTML = `
      <p style="text-align:center;padding:80px 24px;color:#c55;font-size:0.85rem;">
        Couldn't load photos — check the API key setup.<br>
        <small style="opacity:0.6">${err.message}</small>
      </p>`;
  }
}

function wireControls() {
  const filterBtns  = document.querySelectorAll('.filter-btn');
  const items       = document.querySelectorAll('.gallery-full-item');
  const lightbox    = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      items.forEach(item => {
        const show = filter === 'all' || item.dataset.filter === filter || item.dataset.filter === 'all';
        item.style.display = show ? '' : 'none';
      });
    });
  });

  items.forEach(item => {
    item.addEventListener('click', () => {
      const src = item.dataset.src;
      if (!src || !lightbox || !lightboxImg) return;
      lightboxImg.src = src;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });
}

loadGallery();
