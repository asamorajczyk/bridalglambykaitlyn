(function () {
  'use strict';

  const BAR_H = 48;
  let siteContent = null;
  let siteSha     = null;

  // ── INIT ────────────────────────────────────────────────────────────────
  async function init() {
    injectCSS();
    buildBar();
    buildInquiriesPanel();
    buildTextModal();
    buildPhotoModal();
    await loadContent();
    wireText();
    wirePhotos();
  }

  // ── CSS ─────────────────────────────────────────────────────────────────
  function injectCSS() {
    const link = document.createElement('link');
    link.rel  = 'stylesheet';
    link.href = '/css/admin-overlay.css';
    document.head.appendChild(link);

    const style = document.createElement('style');
    style.textContent = [
      `body { padding-top: ${BAR_H}px !important; }`,
      `#main-nav { top: ${BAR_H}px !important; }`,
    ].join('\n');
    document.head.appendChild(style);
  }

  // ── ADMIN BAR ───────────────────────────────────────────────────────────
  function buildBar() {
    const bar = document.createElement('div');
    bar.id = 'ao-bar';
    bar.innerHTML = `
      <span class="ao-label">✏ Admin View</span>
      <div class="ao-actions">
        <button id="ao-inq-btn">Inquiries</button>
        <button id="ao-end-btn">← Public View</button>
      </div>
    `;
    document.body.prepend(bar);

    document.getElementById('ao-inq-btn').addEventListener('click', openInquiries);
    document.getElementById('ao-end-btn').addEventListener('click', () => {
      sessionStorage.removeItem('adminMode');
      location.reload();
    });
  }

  // ── INQUIRIES PANEL ─────────────────────────────────────────────────────
  function buildInquiriesPanel() {
    const panel = document.createElement('div');
    panel.id = 'ao-inq-panel';
    panel.innerHTML = `
      <div class="ao-panel-head">
        <h3>Inquiries</h3>
        <button id="ao-inq-close">✕</button>
      </div>
      <div id="ao-inq-list"><p class="ao-dim">Loading…</p></div>
    `;
    document.body.appendChild(panel);
    document.getElementById('ao-inq-close').addEventListener('click', () => {
      panel.classList.remove('open');
    });
  }

  async function openInquiries() {
    const panel = document.getElementById('ao-inq-panel');
    const list  = document.getElementById('ao-inq-list');
    panel.classList.add('open');
    list.innerHTML = '<p class="ao-dim">Loading…</p>';

    try {
      const { inquiries, error } = await fetch('/api/inquiries').then(r => r.json());
      if (error) throw new Error(error);
      if (!inquiries?.length) {
        list.innerHTML = '<p class="ao-dim">No inquiries yet.</p>';
        return;
      }
      list.innerHTML = inquiries.map(inq => `
        <div class="ao-inq-card">
          <div class="ao-inq-name">${esc(inq.name)}</div>
          <div class="ao-inq-meta">
            ${[inq.service, inq.eventDate].filter(Boolean).map(esc).join(' · ')}
          </div>
          <div class="ao-inq-contact">
            ${[inq.email, inq.phone].filter(Boolean).map(esc).join(' · ')}
          </div>
          ${inq.location ? `<div class="ao-inq-meta">${esc(inq.location)}</div>` : ''}
          ${inq.message  ? `<div class="ao-inq-msg">${esc(inq.message)}</div>` : ''}
          <div class="ao-inq-date">Submitted ${fmtDate(inq.submitted)}</div>
        </div>
      `).join('');
    } catch (e) {
      list.innerHTML = `<p class="ao-dim" style="color:#c55">${esc(e.message)}</p>`;
    }
  }

  // ── SITE CONTENT ────────────────────────────────────────────────────────
  async function loadContent() {
    try {
      const data = await fetch('/api/admin/content').then(r => r.json());
      siteContent = data.content ?? {};
      siteSha     = data.sha;
    } catch (e) {
      console.warn('[Admin] Could not load content:', e);
    }
  }

  // ── TEXT EDITING ────────────────────────────────────────────────────────
  let textModal, textModalTA, textModalStatus, textKey, textEl;

  function buildTextModal() {
    textModal = document.createElement('div');
    textModal.id = 'ao-text-modal';
    textModal.innerHTML = `
      <div class="ao-modal-box">
        <div class="ao-modal-head">
          <span id="ao-text-label"></span>
          <button class="ao-modal-x">✕</button>
        </div>
        <textarea id="ao-text-ta" rows="6"></textarea>
        <div class="ao-modal-foot">
          <span id="ao-text-status" class="ao-status"></span>
          <button id="ao-text-cancel" class="ao-btn-ghost">Cancel</button>
          <button id="ao-text-save"   class="ao-btn-rose">Save</button>
        </div>
      </div>
    `;
    document.body.appendChild(textModal);

    textModalTA     = document.getElementById('ao-text-ta');
    textModalStatus = document.getElementById('ao-text-status');

    const closeText = () => textModal.classList.remove('open');
    textModal.querySelector('.ao-modal-x').addEventListener('click', closeText);
    document.getElementById('ao-text-cancel').addEventListener('click', closeText);
    textModal.addEventListener('click', e => { if (e.target === textModal) closeText(); });

    document.getElementById('ao-text-save').addEventListener('click', async () => {
      const newVal = textModalTA.value;
      textModalStatus.textContent = 'Saving…';
      try {
        const updated = { ...siteContent, [textKey]: newVal };
        const res  = await fetch('/api/admin/content', {
          method:  'PUT',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ content: updated, sha: siteSha }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Save failed');
        siteContent = updated;
        textEl.textContent = newVal;
        textModalStatus.textContent = '✓ Saved';
        await loadContent();
        setTimeout(() => textModal.classList.remove('open'), 700);
      } catch (e) {
        textModalStatus.textContent = '✗ ' + e.message;
      }
    });
  }

  function wireText() {
    document.querySelectorAll('[data-text]').forEach(el => {
      el.classList.add('ao-editable');
      el.addEventListener('click', e => {
        e.stopPropagation();
        const key = el.dataset.text;
        textKey = key;
        textEl  = el;
        document.getElementById('ao-text-label').textContent =
          key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        textModalTA.value          = siteContent?.[key] ?? el.textContent.trim();
        textModalStatus.textContent = '';
        textModal.classList.add('open');
        textModalTA.focus();
      });
    });
  }

  // ── PHOTO EDITING ────────────────────────────────────────────────────────
  let photoModal, photoModalStatus, photoModalSlot;
  let photoFileInput;

  function buildPhotoModal() {
    photoModal = document.createElement('div');
    photoModal.id = 'ao-photo-modal';
    photoModal.innerHTML = `
      <div class="ao-modal-box">
        <div class="ao-modal-head">
          <span id="ao-photo-label">Swap Photo</span>
          <button class="ao-modal-x">✕</button>
        </div>
        <div class="ao-photo-preview-wrap">
          <img id="ao-photo-preview" src="" alt="Current photo" />
        </div>
        <div class="ao-modal-foot">
          <span id="ao-photo-status" class="ao-status"></span>
          <button id="ao-photo-cancel" class="ao-btn-ghost">Cancel</button>
          <button id="ao-photo-choose" class="ao-btn-rose">Choose New Photo</button>
        </div>
      </div>
    `;
    document.body.appendChild(photoModal);

    photoFileInput = document.createElement('input');
    photoFileInput.type    = 'file';
    photoFileInput.accept  = 'image/jpeg,image/png,image/webp';
    photoFileInput.style.display = 'none';
    document.body.appendChild(photoFileInput);

    photoModalStatus = document.getElementById('ao-photo-status');

    const closePhoto = () => photoModal.classList.remove('open');
    photoModal.querySelector('.ao-modal-x').addEventListener('click', closePhoto);
    document.getElementById('ao-photo-cancel').addEventListener('click', closePhoto);
    photoModal.addEventListener('click', e => { if (e.target === photoModal) closePhoto(); });

    document.getElementById('ao-photo-choose').addEventListener('click', () => photoFileInput.click());

    photoFileInput.addEventListener('change', async () => {
      const file = photoFileInput.files[0];
      if (!file) return;
      const btn = document.getElementById('ao-photo-choose');
      btn.disabled = true;
      photoModalStatus.textContent = 'Uploading…';

      try {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('slot', photoModalSlot);
        const res  = await fetch('/api/admin/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Upload failed');

        const previewURL = URL.createObjectURL(file);
        document.querySelectorAll(`img[src*="/images/uploads/${photoModalSlot}"]`).forEach(img => {
          img.src = previewURL;
        });
        document.getElementById('ao-photo-preview').src = previewURL;
        photoModalStatus.textContent = '✓ Uploaded — live on site in ~30 seconds';
        btn.textContent = 'Choose Different Photo';
      } catch (e) {
        photoModalStatus.textContent = '✗ ' + e.message;
      } finally {
        btn.disabled = false;
        photoFileInput.value = '';
      }
    });
  }

  function wirePhotos() {
    document.querySelectorAll('img').forEach(img => {
      const src   = img.getAttribute('src') || '';
      const match = src.match(/\/images\/uploads\/([^/.]+)/);
      if (!match) return;
      const slot = match[1];
      img.classList.add('ao-photo-editable');
      img.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        photoModalSlot = slot;
        document.getElementById('ao-photo-label').textContent =
          'Swap Photo — ' + slot.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        document.getElementById('ao-photo-preview').src = img.src;
        photoModalStatus.textContent = '';
        document.getElementById('ao-photo-choose').textContent = 'Choose New Photo';
        document.getElementById('ao-photo-choose').disabled    = false;
        photoModal.classList.add('open');
      });
    });
  }

  // ── UTILS ────────────────────────────────────────────────────────────────
  function esc(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function fmtDate(s) {
    if (!s) return '';
    try {
      return new Date(s).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      });
    } catch { return s; }
  }

  init();
})();
