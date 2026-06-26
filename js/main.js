// ── LOGO FROM DRIVE ──
(async () => {
  try {
    const FOLDER_ID = '1J5ZeboobsRd_d6NYk3zaNPQDV3nAoQcX';
    const API_KEY   = 'AIzaSyAiC_UjUdzU52KA888sUhteJHJemBZGqUU';
    const q = encodeURIComponent(`'${FOLDER_ID}' in parents and trashed = false`);
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(thumbnailLink,name)&pageSize=5&key=${API_KEY}`
    );
    const { files } = await res.json();
    const logo = files?.find(f => f.thumbnailLink);
    if (logo) {
      const url = logo.thumbnailLink.replace(/=s\d+$/, '=s400');
      document.querySelectorAll('.nav-logo img, .footer-logo img').forEach(img => {
        img.src = url;
      });
    }
  } catch (e) { console.error('Logo load failed', e); }
})();

// ── NAV SCROLL ──
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
  nav?.classList.toggle('scrolled', window.scrollY > 40);
});

// ── HAMBURGER MENU ──
const hamburger = document.querySelector('.hamburger');
const mobileNav = document.querySelector('.mobile-nav');
hamburger?.addEventListener('click', () => {
  mobileNav?.classList.toggle('open');
});
document.querySelectorAll('.mobile-nav a').forEach(link => {
  link.addEventListener('click', () => mobileNav?.classList.remove('open'));
});

// ── LIGHTBOX ──
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');

document.querySelectorAll('.gallery-item[data-src]').forEach(item => {
  item.addEventListener('click', () => {
    const src = item.dataset.src;
    if (src && lightboxImg && lightbox) {
      lightboxImg.src = src;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  });
});

document.getElementById('lightbox-close')?.addEventListener('click', closeLightbox);
lightbox?.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});

function closeLightbox() {
  lightbox?.classList.remove('open');
  document.body.style.overflow = '';
}

// ── CONTACT FORM ──
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxcrKPd4kGw4MoE0IY5VerOpGqqd1CfKdUkJDs1MywOcdTShKbQJ32ssuh3MRG53ltb/exec'; // ← paste after deploying

const form = document.getElementById('contact-form');
const success = document.getElementById('form-success');

form?.addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = form.querySelector('button[type="submit"]');
  btn.textContent = 'Sending…';
  btn.disabled = true;

  fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    body: new URLSearchParams(new FormData(form))
  }).finally(() => {
    form.style.display = 'none';
    if (success) success.style.display = 'block';
  });
});

// ── SCROLL REVEAL ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.service-card, .testimonial-card, .gallery-item').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});
