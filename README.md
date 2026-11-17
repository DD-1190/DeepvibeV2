# DeepVibe — website v2

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 3 · GSAP + ScrollTrigger · Framer Motion · Lucide

**Status:** Sections 01–05 and 07–10 are built. Section 06 (Our approach) is not built yet; its slot is marked in `app/page.tsx`.

## Deploy (Vercel)

`vercel.json` pins the framework to Next.js, so the build works even if the Vercel project was created before the code was uploaded. Import the repo → Deploy. Don't set `STATIC_EXPORT` on Vercel.

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
  chat/              the project assistant (see below)
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

## Custom cursor

`components/cursor/CustomCursor.tsx` (mounted in `app/layout.tsx`). Desktop + fine pointer only; touch devices keep
the native cursor. Opt any element into a state with a data attribute:

| attribute | look |
|---|---|
| `data-cursor="hover"` | ring expands to 54 px (links/buttons get this automatically) |
| `data-cursor="view"` | filled 76 px lime disc with "VIEW ↗" (portfolio cards) |
| `data-cursor="play"` / `"pause"` | 64 px glass circle with icon (founder video, once a video is set) |
| `data-cursor="drag"` | "‹ DRAG ›" (the draggable client strip) |
| `data-cursor="none"` | force the default dot |
| `data-cursor-label="…"` | custom label for view/drag |

Text fields and text selection keep the native I-beam. Cursor checks: `python3 scripts/qa-cursor.py http://localhost:3000`.

## QA

`scripts/qa.py` runs 29 automated checks with Playwright (`pip install playwright && playwright install chromium`):
images at 1× and 2× (retina), failed requests, console errors, hidden-after-scroll content, in-page links,
headings, accessible names, SEO meta, nav behaviour, form validation, currency switch, vibe toggle, skip link,
no sideways scroll at 320–1920 px, mobile menu (open / Esc / focus return) and reduced motion.

    npm run build && npm start        # then, in another terminal:
    python3 scripts/qa.py http://localhost:3000

## Project assistant (AI contact chat)

Every "Let's talk" / "Start a project" CTA opens a glass chat docked bottom-right (full-screen on phones).
It asks one thing at a time — project type → a smart follow-up → the idea → support needed → budget
(optional, ₹/$) → timeline → contact details — then shows an editable summary. **Nothing is sent until the
visitor presses "Submit project enquiry".** The conversation lives in `sessionStorage` only (survives
minimising and reloads in that tab, gone when the tab closes). Nothing is stored on the server.

Any element with `data-open-chat` opens it (`data-open-chat="An AI-powered experience"` pre-answers the
first question; `data-chat-note="…"` adds a note). `<MagneticButton openChat>` sets it for you.

```
components/chat/   ContactChatModal, ChatHeader, ChatMessage, QuickReplyChips, ChatInput,
                   ContactDetailsForm, ProjectSummary, TypingIndicator, VibeMark
lib/chat/          flow.ts (questions, chips, budgets, skip logic), store.ts (state), validate.ts, types.ts
app/api/contact/   chat/route.api.ts (OpenAI Responses API), submit/route.api.ts (delivery)
```

**Turn on the AI (optional)** — Vercel → Settings → Environment Variables → `OPENAI_API_KEY` (and optionally
`OPENAI_MODEL`, default `gpt-5-mini`). Redeploy. The model only phrases questions and pulls details out of
free text; it is told never to quote prices, timelines, clients or guarantees. Without a key — or if OpenAI
is slow/down — the same conversation runs from the built-in script, so the chat never breaks.

**Connect delivery (required to receive enquiries)** — add at least one, then redeploy:
- *Email (Resend)*: `RESEND_API_KEY`, `CONTACT_TO_EMAIL` (your inbox), `CONTACT_FROM_EMAIL` (an address on a
  domain verified in Resend). The visitor's email is the reply-to — just hit Reply.
- *Formspree*: `FORMSPREE_ENDPOINT`.
- *CRM / Zapier / Make / Slack*: `CONTACT_WEBHOOK_URL` — gets the structured JSON (name, email, company,
  website, project_type, project_description, services_required[], budget, currency, timeline, additional_notes).

The submit route validates everything, rate-limits (5 per 10 min per IP), rejects bots (honeypot, link spam,
cross-site posts) and ignores double submits. If nothing is configured the visitor is told plainly that the
enquiry was **not** sent. `.env.local` is gitignored — never commit keys.

`STATIC_EXPORT=1` builds have no `/api`: the chat runs scripted, and submissions work only if
`NEXT_PUBLIC_WEB3FORMS_KEY` is set.

## Still to fill in

- `site.email`, `site.socials`, `about.linkedin` in `data/site.ts` (hidden until set)
- `proof.testimonials` (verified quotes only — the block is hidden while empty) and optional logo files for `proof.experienceWith`
- Enquiry delivery + optional `OPENAI_API_KEY` (see Project assistant)
- `/public/images/og.jpg` (1200×630) and reference it in `app/layout.tsx`
- Favicon (`app/icon.png` or `app/icon.svg`)
