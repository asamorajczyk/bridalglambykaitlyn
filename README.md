# Bridal Glam by Kaitlyn — Website

A 5-page static website for Kaitlyn Magnuson's hair and makeup business.

## File Structure

```
bridal-glam-by-kaitlyn/
├── index.html              ← Home page
├── css/
│   └── styles.css          ← All styles
├── js/
│   └── main.js             ← Nav, lightbox, scroll, form
├── images/                 ← PUT YOUR IMAGES HERE
│   ├── logo.png            ← Her logo (the KM monogram file)
│   ├── favicon.png         ← Small logo for browser tab
│   ├── hero.jpg            ← Hero image (tall portrait)
│   ├── kaitlyn.jpg         ← Photo of Kaitlyn (home about strip)
│   ├── kaitlyn-about.jpg   ← Photo of Kaitlyn (about page)
│   └── gallery/            ← All portfolio photos go here
│       ├── look-01.jpg
│       ├── look-02.jpg
│       └── ...
└── pages/
    ├── services.html
    ├── gallery.html
    ├── about.html
    └── contact.html
```

## Setup Steps

### 1. Add the Logo
- Save her logo PNG to `/images/logo.png`
- Save a small version (32x32 or 64x64) to `/images/favicon.png`

### 2. Add Photos
- Drop all photos into the `/images/` folder
- For gallery photos, use `/images/gallery/` subfolder

### 3. Swap Placeholders for Real Photos

**In `index.html`** (hero):
```html
<!-- Remove this: -->
<div class="hero-image-placeholder">Your hero photo here</div>
<!-- Add this: -->
<img src="images/hero.jpg" alt="Bridal makeup by Kaitlyn" />
```

**In `pages/gallery.html`** — for each gallery item:
```html
<!-- Remove placeholder div, add: -->
<img src="../images/gallery/look-01.jpg" alt="Bridal look" />
```
Also add `data-src="../images/gallery/look-01.jpg"` to the parent `.gallery-full-item` div to enable the lightbox.

### 4. Set Up the Contact Form
The form currently shows a success message on submit (good for testing).
To make it actually send emails, use **Formspree** (free):

1. Go to [formspree.io](https://formspree.io) → create account → New Form
2. Copy your form endpoint (looks like `https://formspree.io/f/xabc1234`)
3. In `pages/contact.html`, change the `<form>` tag to:
   ```html
   <form action="https://formspree.io/f/YOUR_ID" method="POST" id="contact-form">
   ```

### 5. Deploy to GitHub Pages
1. Create a new repo on GitHub (e.g. `bridalglamkaitlyn`)
2. Upload all files maintaining the folder structure
3. Go to repo Settings → Pages → Source: `main` branch, `/ (root)`
4. Site will be live at: `https://yourusername.github.io/bridalglamkaitlyn/`

**Custom domain** (optional):
- Buy a domain (e.g. `bridalglamkaitlyn.com` on Namecheap ~$10/yr)
- In GitHub Pages settings, add your custom domain
- Update DNS at your registrar to point to GitHub Pages

## Customization Notes

- **Colors** — all defined as CSS variables in `css/styles.css` at the top
- **Testimonials** — replace placeholder quotes in `index.html` with real client quotes
- **Services** — edit `pages/services.html` to update what's offered
- **FAQ** — edit `pages/contact.html` to add/remove questions
- **Copyright year** — update in all 5 files' footers
