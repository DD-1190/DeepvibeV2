import { readFileSync } from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';

export type Source = { title: string; href: string; note: string };

export type Post = {
  slug: string;
  title: string;
  dek: string;
  /** ISO date, e.g. 2026-11-23 */
  date: string;
  topics: string[];
  author: string;
  /** Feature image: base path without size/extension, e.g. /images/journal/x → x-900.webp, x-1536.webp, x-og.jpg */
  image?: { base: string; alt: string; width: number; height: number };
  /** Optional film shown instead of the feature image on the article page */
  video?: { src: string; poster: string; width: number; height: number; title: string };
  sources: Source[];
};

/** Newest first. Each post's body lives in content/journal/<slug>.md */
export const posts: Post[] = [
  {
    slug: 'the-habit-comes-first',
    title: 'The Habit Comes First: What Email, Photos and Reels Might Teach Us About Everyday AI',
    dek: 'The tools we use to share keep changing while the wish to share does not. AI may become part of everyday life only where it fits a habit people already have, on terms they feel they control.',
    date: '2026-11-23',
    topics: ['Consumer AI', 'Product thinking'],
    author: 'Naman Rampal',
    image: {
      base: '/images/journal/the-habit-comes-first',
      alt: 'Paper collage on a blue background: two young people laugh together over a phone, surrounded by paper fragments of an envelope with a photo, a social post and a vertical video, while a person wearing glasses looks on, all linked by a hand-drawn line.',
      width: 1536,
      height: 1024,
    },
    video: {
      src: '/video/journal/the-habit-comes-first.mp4',
      poster: '/images/journal/the-habit-comes-first-film.jpg',
      width: 1280,
      height: 720,
      title: 'The Habit Comes First — a 48-second film with voiceover',
    },
    sources: [
      { title: 'NPR — Ray Tomlinson, inventor of modern email, dies (2016)', href: 'https://www.npr.org/2016/03/06/469428062/ray-tomlinson-inventor-of-modern-email-has', note: '1971 person-to-person network email on the ARPANET, a US government network.' },
      { title: 'Internet Hall of Fame — Ray Tomlinson', href: 'https://www.internethalloffame.org/?p=76', note: 'The @ sign separating user from host.' },
      { title: 'Microsoft News — MSN Hotmail at three (1999)', href: 'https://news.microsoft.com/?p=12169', note: 'Hotmail’s launch on 4 July 1996 and 40+ million users by mid-1999.' },
      { title: 'Britannica — Instagram', href: 'https://www.britannica.com/money/Instagram', note: 'Release on 6 October 2010; one million users in under three months.' },
      { title: 'Instagram — Introducing Instagram Reels (2020)', href: 'https://about.instagram.com/blog/announcements/introducing-instagram-reels-announcement', note: 'Launch and format of Reels, August 2020.' },
      { title: 'OpenAI — How people are using ChatGPT (2025)', href: 'https://openai.com/index/how-people-are-using-chatgpt/', note: 'About 70% of consumer usage is non-work; consumer plans only.' },
      { title: 'Meta — Meta Ray-Ban Display', href: 'https://www.meta.com/blog/meta-ray-ban-display-ai-glasses-connect-2025/', note: 'US availability from 30 September 2025 at $799; capture light when recording.' },
      { title: 'heise — Meta sold seven million smart glasses', href: 'https://heise.de/-11173680', note: 'More than 7 million sold in 2025, per EssilorLuxottica.' },
      { title: 'InformationWeek — Google Glass killed, for now (2015)', href: 'https://www.informationweek.com/mobile-devices/google-glass-killed-for-now', note: 'Explorer sales ended January 2015; Forrester: 43% interest, 50% privacy concerns.' },
      { title: 'O’Reilly — Designing for Wearables: The Glass Experiment', href: 'https://www.oreilly.com/library/view/designing-for-wearables/9781491944141/ch04.html', note: 'First Explorer units shipped April 2013; privacy backlash.' },
      { title: 'Pew Research Center — How Americans View AI (2025)', href: 'https://www.pewresearch.org/science/2025/09/17/how-americans-view-ai-and-its-impact-on-people-and-society/', note: 'June 2025: 50% more concerned than excited, 10% more excited; most want more control.' },
    ],
  },
];

export const getPost = (slug: string) => posts.find((p) => p.slug === slug);

export function readingMinutes(md: string) {
  return Math.max(1, Math.round(md.split(/\s+/).length / 220));
}

/** Markdown → HTML at build time. External links open in a new tab. */
export function renderPost(slug: string) {
  const md = readFileSync(path.join(process.cwd(), 'content/journal', `${slug}.md`), 'utf8');
  const renderer = new marked.Renderer();
  renderer.link = function ({ href, tokens }) {
    const text = this.parser.parseInline(tokens);
    return /^https?:\/\//.test(href)
      ? `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`
      : `<a href="${href}">${text}</a>`;
  };
  const html = marked.parse(md, { renderer, async: false }) as string;
  return { html, minutes: readingMinutes(md) };
}

export const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
