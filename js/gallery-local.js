async function loadGallery() {
  const gallery = document.getElementById('gallery');
  gallery.innerHTML = '<p style="text-align:center;padding:80px 24px;color:#aaa;font-size:0.9rem;">Loading gallery…</p>';

  try {
    const items = await fetch('/content/gallery.json').then(r => r.json());

    if (!items.length) {
      gallery.innerHTML = '<p style="text-align:center;padding:80px 24px;color:#aaa;">No photos yet.</p>';
      return;
    }

    gallery.innerHTML = '';
    items.forEach(({ file, category }) => {
      const tag      = category || 'all';
      const src      = `/images/gallery/${file}`;
      const labelText = tag !== 'all' ? tag.charAt(0).toUpperCase() + tag.slice(1) : '';

      const div = document.createElement('div');
      div.className    = 'gallery-full-item';
      div.dataset.filter = tag;
      div.dataset.src    = src;
      div.innerHTML = `
        <img src="${src}" alt="Gallery photo" loading="lazy" />
        ${labelText ? `<div class="gallery-label"><span>${labelText}</span></div>` : ''}
      `;
      gallery.appendChild(div);
    });

    wireControls();
  } catch (err) {
    console.error(err);
    gallery.innerHTML = `<p style="text-align:center;padding:80px 24px;color:#c55;font-size:0.85rem;">Couldn't load gallery.<br><small>${err.message}</small></p>`;
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
