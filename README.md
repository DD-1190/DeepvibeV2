# DeepVibe — website v2

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 3 · GSAP + ScrollTrigger · Framer Motion · Lucide

**Status:** Sections 01–05 and 07–10 are built. Section 06 (Our approach) is not built yet; its slot is marked in `app/page.tsx`.

## Run

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
STATIC_EXPORT=1 npm run build   # fully static site in /out, for your own server (nginx, Apache, any CDN)
```

> Use TypeScript 5.x. Next 15 can't use the TypeScript 7 native compiler.

## Where things live

```
app/                 layout (fonts, SEO, JSON-LD), page, robots.ts, sitemap.ts, globals.css
components/
  navigation/        Navbar (transparent → glass on scroll, hides on scroll-down), MobileMenu (full-screen overlay)
  hero/              Hero (GSAP entrance + scroll parallax + cursor spotlight/tilt), FounderVideo, VideoPlaceholder,
                     HeroBackground, ScrollIndicator
  ui/                MagneticButton, RollText, ArrowSwap, Logo
  layout/            UpNext (temporary)
data/site.ts         ALL copy + founder video paths + email/socials (placeholders are null)
hooks/               useMagnetic, useMotionPrefs
tailwind.config.ts   design tokens (colours, type scale, motion keyframes)
```

## Adding the founder film

1. Put the encodes in `public/videos/` (see `public/videos/README.md` for sizes + ffmpeg commands).
2. Set the paths in `data/site.ts → founderVideo`.

The component handles WebM → MP4 fallback, a separate mobile encode (phones never download the desktop file), poster, muted autoplay + loop,
play/pause, a sound toggle, pausing when off-screen, no autoplay for reduced-motion users, and it drops back to the placeholder if a file fails to load.

## QA

`scripts/qa.py` runs 29 automated checks with Playwright (`pip install playwright && playwright install chromium`):
images at 1× and 2× (retina), failed requests, console errors, hidden-after-scroll content, in-page links,
headings, accessible names, SEO meta, nav behaviour, form validation, currency switch, vibe toggle, skip link,
no sideways scroll at 320–1920 px, mobile menu (open / Esc / focus return) and reduced motion.

    npm run build && npm start        # then, in another terminal:
    python3 scripts/qa.py http://localhost:3000

## Enquiry form → your inbox

The form sends JSON (name, email, company, project type, budget + currency, message) and only shows
"Thank you" when the service confirms it received it. Pick one:

**Option A — Web3Forms (fastest, free)**
1. Open https://web3forms.com, type the email address that should receive enquiries, submit.
2. Copy the Access Key they email you.
3. `cp .env.example .env.local` → `NEXT_PUBLIC_WEB3FORMS_KEY=<your key>`
4. Rebuild (`npm run build`). On Vercel: Project → Settings → Environment Variables → add the same key, redeploy.

**Option B — Formspree**
1. Sign up at https://formspree.io with your email → New form → copy the endpoint (`https://formspree.io/f/xxxx`).
2. `.env.local` → `NEXT_PUBLIC_FORM_ENDPOINT=<endpoint>`, rebuild/redeploy.
3. Confirm the verification email Formspree sends the first time.

Each enquiry arrives as an email to you with the visitor's address set as reply-to, so you can just hit Reply.
Without either variable, the form tells visitors it isn't live yet (nothing is sent).
Validation, accessible errors, a honeypot spam field and a USD / INR budget switch (auto-INR for India) are built in.

## Still to fill in

- `site.email`, `site.socials`, `about.linkedin` in `data/site.ts` (hidden until set)
- `proof.testimonials` (verified quotes only — the block is hidden while empty) and optional logo files for `proof.experienceWith`
- `NEXT_PUBLIC_FORM_ENDPOINT` (see above)
- `/public/images/og.jpg` (1200×630) and reference it in `app/layout.tsx`
- Favicon (`app/icon.png` or `app/icon.svg`)
