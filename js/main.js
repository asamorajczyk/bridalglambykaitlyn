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
const lightbox    = document.getElementById('lightbox');
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

// ── TEXT CONTENT ──
// Fetches /content/site.json and fills all [data-text="key"] elements.
// Falls back silently — the HTML already has default text.
async function loadTextContent() {
  try {
    const content = await fetch('/content/site.json').then(r => r.json());
    Object.entries(content).forEach(([key, value]) => {
      if (!value) return;
      document.querySelectorAll(`[data-text="${key}"]`).forEach(el => {
        el.textContent = value;
      });
    });
  } catch (e) {
    console.warn('Could not load site content:', e);
  }
}

// ── CONTACT FORM ──
const form    = document.getElementById('contact-form');
const success = document.getElementById('form-success');

form?.addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = form.querySelector('button[type="submit"]');
  btn.textContent = 'Sending…';
  btn.disabled    = true;

  fetch('/api/contact', {
    method: 'POST',
    body:   new FormData(form),
  })
    .then(r => r.json())
    .catch(() => ({}))
    .finally(() => {
      form.style.display = 'none';
      if (success) success.style.display = 'block';
    });
});

// ── SCROLL REVEAL ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity   = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.service-card, .testimonial-card, .gallery-item').forEach(el => {
  el.style.opacity   = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});
