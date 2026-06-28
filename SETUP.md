# Deployment & Setup Guide
## Bridal Glam by Kaitlyn

Follow these steps in order. Each section is a one-time setup.

---

## 1. Push to GitHub

Make sure this project is in a GitHub repository. If it isn't yet:

1. Go to github.com → New Repository → name it `bridalglambykaitlyn` → Create
2. In your terminal, from this project folder:
   ```
   git remote add origin https://github.com/YOUR_USERNAME/bridalglambykaitlyn.git
   git push -u origin main
   ```

---

## 2. Set Up Airtable (Inquiry Storage)

1. Go to **airtable.com** → Sign Up (free)
2. Create a new **Base** → name it "Bridal Glam by Kaitlyn"
3. Rename the default table to **Inquiries**
4. Set up these fields (rename/add as needed):

   | Field Name   | Field Type        |
   |--------------|-------------------|
   | Name         | Single line text  |
   | Email        | Email             |
   | Phone        | Phone number      |
   | Event Date   | Date              |
   | Service      | Single line text  |
   | Location     | Single line text  |
   | Message      | Long text         |
   | Submitted    | Created time      |

5. Get your **Base ID**: open the base → look at the URL → it starts with `app...` (e.g., `appXXXXXXXXXXXXXX`)
6. Get your **API Token**: go to airtable.com/create/tokens → Create Token → give it `data.records:read` and `data.records:write` scope for your base → copy the token

---

## 3. Set Up Resend (Email Notifications)

1. Go to **resend.com** → Sign Up (free — 3,000 emails/month)
2. Add your domain (`bridalglambykaitlyn.com`) → follow their DNS verification steps (adds a few TXT/CNAME records in Cloudflare)
3. Go to API Keys → Create API Key → copy it

---

## 4. Create a GitHub Fine-Grained Token (For Admin Content Editing)

This lets the admin panel save text changes directly to the website.

1. Go to **github.com** → Settings → Developer Settings → Fine-grained tokens → Generate new token
2. Set:
   - Token name: `Bridal Glam Admin`
   - Expiration: 1 year (you'll renew annually)
   - Repository access: Only select `bridalglambykaitlyn`
   - Permissions: **Contents** → Read and Write
3. Copy the token (you only see it once)

---

## 5. Deploy to Cloudflare Pages

1. Go to **dash.cloudflare.com** → Sign Up (free)
2. Go to **Workers & Pages** → Create → Pages → Connect to Git
3. Select your GitHub repository → Authorize
4. Build settings:
   - Framework preset: **None**
   - Build command: *(leave blank)*
   - Build output directory: `/` *(or leave blank)*
5. Click **Save and Deploy** — your site will be live at a `*.pages.dev` URL

### Add Environment Variables

In Cloudflare Pages → your project → Settings → Environment Variables → Add:

| Variable Name      | Value                                    |
|--------------------|------------------------------------------|
| `AIRTABLE_TOKEN`   | Your Airtable API token                  |
| `AIRTABLE_BASE_ID` | Your Airtable base ID (starts with `app`) |
| `RESEND_API_KEY`   | Your Resend API key                      |
| `GITHUB_TOKEN`     | Your GitHub fine-grained token           |
| `GITHUB_REPO`      | `YOUR_USERNAME/bridalglambykaitlyn`      |
| `SITE_DOMAIN`      | `bridalglambykaitlyn.com`                |

Add these to **both** Production and Preview environments.

---

## 6. Connect Your Custom Domain

1. In Cloudflare Pages → your project → Custom Domains → Set up a custom domain
2. Enter `bridalglambykaitlyn.com` → follow the prompts
3. If your domain is registered elsewhere (GoDaddy, Namecheap, etc.), you'll update the nameservers to point to Cloudflare — Cloudflare walks you through this
4. Once connected, SSL is automatic and free

---

## 7. Protect the Admin Panel (Cloudflare Access)

This is the login that protects Kaitlyn's admin area so only she can access it.

Do this **three times** — once for each path below:
- `/admin`
- `/api/admin`
- `/api/inquiries`

### Steps for each application

**In Cloudflare dashboard → Zero Trust → Access → Applications → Add an Application → Self-hosted**

#### Page 1 — Application Configuration
| Field | Value |
|-------|-------|
| Application name | `Bridal Glam Admin` (use `Bridal Glam API Admin` and `Bridal Glam API Inquiries` for the other two) |
| Session Duration | `24 hours` (or leave default) |
| Subdomain | *(leave blank)* |
| Domain | `bridalglambykaitlyn.pages.dev` *(use `bridalglambykaitlyn.com` once the custom domain is connected — see Step 6)* |
| Path | `/admin` (then `/api/admin`, then `/api/inquiries` for the other two) |

Leave everything else on this page at its default. Click **Next**.

#### Page 2 — Policies
1. Click **Add a policy**
2. Fill in:
   | Field | Value |
   |-------|-------|
   | Policy name | `Kaitlyn` |
   | Action | `Allow` |
3. Under **Configure rules → Include**, click **Add require** (or the `+` next to Include)
4. In the selector dropdown, choose **Emails**
5. In the value field, enter `bridalbykaitlyn@outlook.com`
6. Click **Save policy**

Click **Next**.

#### Page 3 — Setup (Authentication)
No changes needed here. Cloudflare One-Time PIN (email code) is enabled by default — that's all Kaitlyn needs.

Click **Next** → **Add application**.

---

Repeat all steps above for the other two paths (`/api/admin` and `/api/inquiries`).

---

**How Kaitlyn logs in:**
- She goes to `bridalglambykaitlyn.com/admin`
- Cloudflare shows a login page — she enters her email
- She gets a 6-digit code in her email inbox
- She enters the code — she's in
- No password, no app to download

---

## 8. Upload Photos via the Admin Panel

Once the site is live:

1. Kaitlyn (or you) goes to `bridalglambykaitlyn.com/admin`
2. Click the **Photos** tab
3. For each slot (Hero, About, Services, Logo), click "Choose Photo" and upload a JPG/PNG
4. The site updates automatically in about 30 seconds

**Recommended photo sizes:**
- Hero photo: landscape, at least 1400px wide
- About/portrait photos: portrait orientation, at least 800px tall
- Service photos: landscape, at least 900px wide
- Logo: transparent PNG preferred, at least 400px wide
- Max file size: 8 MB per photo

---

## 9. Gallery Photos (Unchanged)

The gallery page (`/pages/gallery.html`) still loads photos from your Google Drive folder. To add gallery photos, drop them into the Google Drive folder as before. No change needed here.

To eventually move the gallery out of Google Drive, that's a separate project — the folder structure and categories would become folders inside `images/gallery/` in the repo.

---

## What Kaitlyn Does Day-to-Day

| Task | How |
|------|-----|
| Check new inquiries | Go to `bridalglambykaitlyn.com/admin` → Inquiries tab |
| Get notified of new inquiry | Email arrives automatically at `bridalbykaitlyn@outlook.com` |
| Update bio text | Admin → Edit Website tab → change text → Save |
| Swap a photo | Admin → Photos tab → upload new photo |
| Add gallery photos | Drop into Google Drive gallery folder |

---

## Renewing the GitHub Token

The GitHub fine-grained token expires after 1 year. When it expires, the "Edit Website" and "Photos" features in the admin panel will stop working. To renew:

1. Go to github.com → Settings → Developer Settings → Fine-grained tokens
2. Find `Bridal Glam Admin` → Regenerate
3. Copy the new token
4. Go to Cloudflare Pages → Settings → Environment Variables → update `GITHUB_TOKEN`
