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
const form = document.getElementById('contact-form');
const success = document.getElementById('form-success');

form?.addEventListener('submit', (e) => {
  e.preventDefault();
  // Replace with Formspree or Netlify Forms action when deploying
  form.style.display = 'none';
  if (success) success.style.display = 'block';
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
