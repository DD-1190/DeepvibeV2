/**
 * Single source of truth for site content.
 * Anything marked `null` / `[]` is an intentional, replaceable placeholder —
 * the UI hides or shows a clearly labelled placeholder until real values are added.
 */

export type NavItem = { label: string; href: string };
export type SocialLink = { label: string; href: string };

export const site = {
  /** WhatsApp number that receives project enquiries (country code, digits only). */
  whatsapp: '919873470074',
  name: 'DeepVibe',
  url: 'https://deepvibe.in',
  tagline: 'We design what comes next.',
  description:
    'DeepVibe is an independent digital product design studio. We partner with ambitious founders, product leaders and engineering teams to turn complex challenges into clear strategies, exceptional digital experiences and meaningful business outcomes.',
  founder: {
    name: 'Naman Rampal',
    role: 'Founder, DeepVibe',
  },
  /** TODO: add the real studio email, e.g. 'hello@…' */
  email: null as string | null,
  /** TODO: add real profiles, e.g. { label: 'LinkedIn', href: 'https://…' } */
  socials: [] as SocialLink[],
  nav: [
    { label: 'Work', href: '#work' },
    { label: 'Services', href: '#services' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ] satisfies NavItem[],
  cta: { label: "Let's Talk", href: '#contact' },
};

export const hero = {
  eyebrow: 'Independent Digital Product Design Studio',
  /** Rendered word by word for the staggered reveal. Words listed in `highlight` get the lime accent. */
  headline: 'We turn ambitious ideas into exceptional digital experiences.',
  highlight: ['exceptional'],
  sub: "Strategy, design and technology for businesses ready to build what's next.",
  primaryCta: { label: 'Start a project', href: '#contact' },
  secondaryCta: { label: 'Explore our work', href: '#work' },
  pillars: ['Strategy', 'Design', 'Technology'],
};

/**
 * Founder film. Drop files into /public/videos and set the paths below, e.g.
 *   webm: '/videos/founder.webm', mp4: '/videos/founder.mp4', poster: '/images/founder-poster.jpg'
 * Mobile sources are optional — use a lighter, vertical (4:5 or 9:16) encode for phones.
 * While every source is null, a labelled placeholder is shown instead of a video.
 */
export const founderVideo = {
  webm: null as string | null,
  mp4: '/video/founder.mp4' as string | null,
  mobileWebm: null as string | null,
  mobileMp4: null as string | null,
  /** Poster frame — shown instantly, and used as the hero portrait until a video is added. */
  poster: '/images/founder-poster.jpg' as string | null,
  /** Still portrait (WebP + JPG fallback) shown when no video source is set. */
  portrait: { webp: '/images/hero-portrait.webp', jpg: '/images/hero-portrait.jpg' } as { webp: string; jpg: string } | null,
  /** One-line subtitle shown over the film (optional). */
  caption: 'We design what comes next.',
};

export const philosophy = {
  index: '03',
  label: 'Philosophy',
  headline: "Great products don't happen by accident.",
  /** Word(s) that settle into acid lime once the headline has lit up. */
  highlight: ['accident.'],
  /** Supporting line; words in `principles` are emphasised inline. */
  sub: 'They emerge from curiosity, clarity, collaboration and a deep understanding of people.',
  principles: ['Curiosity', 'Clarity', 'Collaboration', 'People'],
  visual: { webp: '/images/philosophy-chrome.webp', png: '/images/philosophy-chrome.png', width: 795, height: 605 },
};

/* ───────────────────────── Section 04 — Selected work ───────────────────────── */

export type ProjectMetric = { value: string; label: string; /** 'target' metrics are goals, not achieved results. */ kind?: 'result' | 'target' };
export type Project = {
  slug: string;
  name: string;
  client: string;
  /** Short tags shown on the card. */
  category: string[];
  /** One- or two-line card copy. */
  summary: string;
  /** Full write-up (kept for the future case-study page). */
  description: string;
  metrics: ProjectMetric[];
  image: { src1600: string; src900: string; width: number; height: number; alt: string; position?: string };
  /** Set when a case-study page exists. While null, the card offers "Case study on request" → contact. */
  caseStudyHref: string | null;
  /** Layout hint for the editorial grid. */
  size: 'large' | 'small';
};

const img = (slug: string, alt: string, width = 1600, height = 900, position?: string) => ({
  src1600: `/images/work/${slug}-1600.webp`,
  src900: `/images/work/${slug}-900.webp`,
  width,
  height,
  alt,
  position,
});

export const work = {
  index: '04',
  label: 'Selected Work',
  headline: 'Ideas made tangible.',
  projects: [
    {
      slug: 'naukri',
      name: 'Naukri Healthcare',
      client: 'Naukri',
      category: ['Growth design', 'Conversion', 'Mobile web'],
      summary:
        'Rethought the paid-traffic landing journey so healthcare job seekers see the platform’s value before the registration form — cutting acquisition cost through conversion.',
      description:
        'Naukri aimed to lower paid acquisition costs by improving conversion from performance marketing traffic. Earlier, all paid users landed directly on the registration form, causing ~75% bounce as users lacked context about the platform’s value.',
      metrics: [{ value: '+1,600', label: 'Daily signups' }],
      image: img('naukri', 'Naukri Healthcare mobile landing page showing healthcare job categories and hiring companies'),
      caseStudyHref: null,
      size: 'large',
    },
    {
      slug: 'coinpoker',
      name: 'CoinPoker Revamp',
      client: 'CoinPoker',
      category: ['Product revamp', 'Gaming', 'Mobile app'],
      summary:
        'A more engaging, intuitive and premium poker experience — a structured lobby, visually rich game categories and streamlined journeys from entering the platform to joining a game.',
      description:
        'CoinPoker aimed to create a more engaging, intuitive, and premium poker experience by rethinking its core product experience. The revamp focused on simplifying game discovery, improving navigation, strengthening visual hierarchy, and making key poker experiences more accessible. By introducing a more structured lobby, visually rich game categories, and streamlined player journeys, the goal was to reduce friction between entering the platform and joining a game.',
      metrics: [{ value: '+15–20%', label: 'Target improvement in game discovery engagement', kind: 'target' }],
      image: img('coinpoker', 'CoinPoker mobile lobby with cash game and tournament categories', 1600, 900, '50% 50%'),
      caseStudyHref: null,
      size: 'small',
    },
    {
      slug: 'hackerearth',
      name: 'HackerEarth Tech Assessment Platform',
      client: 'HackerEarth',
      category: ['Enterprise SaaS', 'HR tech', 'End-to-end design'],
      summary:
        'Led end-to-end product design for HackerEarth’s Assessment, FaceCode and L&D modules.',
      description:
        'Led end-to-end product design for HackerEarth’s Assessment, FaceCode, and L&D modules, improving recruiter efficiency by 30% while powering 200K+ developer assessments annually.',
      metrics: [
        { value: '30%', label: 'Recruiter efficiency' },
        { value: '200K+', label: 'Developer assessments / year' },
      ],
      image: img('hackerearth', 'HackerEarth assessment settings with proctoring and ID verification options', 1600, 900, '30% 0%'),
      caseStudyHref: null,
      size: 'small',
    },
    {
      slug: 'insider',
      name: 'Insider Action Builder',
      client: 'Insider',
      category: ['No-code builder', 'Marketing automation', 'SaaS'],
      summary:
        'A no-code visual builder for marketing automation sequences, reducing user errors and time-to-campaign-launch.',
      description:
        'Designed a no-code visual builder for marketing automation sequences, reducing user errors and time-to-campaign-launch.',
      metrics: [{ value: '50+', label: 'D2C brands in Q1' }],
      image: img('insider', 'Insider action builder canvas with template, elements panel and onboarding tooltip'),
      caseStudyHref: null,
      size: 'large',
    },
    {
      slug: 'truckx',
      name: 'TruckX Country-wide Launch',
      client: 'TruckX',
      category: ['Logistics', 'Fleet SaaS', 'Data-dense UI'],
      summary:
        'Overhauled the dispatch visibility map and routing tools — a high-density, low-clutter interface for fleet operators.',
      description:
        'Overhauled the dispatch visibility map and routing tools. Created a high-density, low-clutter interface for fleet operators.',
      metrics: [{ value: '~25%', label: 'Faster route planning' }],
      image: img('truckx', 'TruckX geofence map with live vehicle positions and an activity timeline'),
      caseStudyHref: null,
      size: 'large',
    },
    {
      slug: 'betaout',
      name: 'Betaout → Bluecore',
      client: 'Betaout',
      category: ['0→1', 'E-commerce personalisation', 'Acquisition'],
      summary:
        'Designed the core product from ideation to PMF, then navigated the pivot to e-commerce personalisation that led to its acquisition.',
      description:
        'Designed the core product from ideation to PMF. Navigated pivot to ecommerce personalization resulting in eventual acquisition.',
      metrics: [{ value: '0→1', label: 'Ideation → PMF → acquired by Bluecore' }],
      image: img('betaout', 'The Betaout team celebrating together', 1600, 900, '50% 40%'),
      caseStudyHref: null,
      size: 'small',
    },
  ] as Project[],
};

/* ───────────────────────── Section 05 — Services ───────────────────────── */

export type Service = {
  id: string;
  title: string;
  description: string;
  /** Capability tags — taken from the description. */
  capabilities: string[];
  /** Which animated glyph to show when the panel is open. */
  glyph: 'strategy' | 'experience' | 'systems' | 'brand';
};

export const services = {
  index: '05',
  label: 'Services & Capabilities',
  headline: 'Designing the future of digital experiences.',
  highlight: ['future'],
  cta: { label: 'Discuss your project', href: '#contact' },
  items: [
    {
      id: 'product-strategy',
      title: 'Product Strategy',
      description: 'Research, discovery, product thinking and digital product direction.',
      capabilities: ['Research', 'Discovery', 'Product thinking', 'Digital product direction'],
      glyph: 'strategy',
    },
    {
      id: 'experience-design',
      title: 'Experience Design',
      description: 'UX strategy, UI design, interaction design and prototyping.',
      capabilities: ['UX strategy', 'UI design', 'Interaction design', 'Prototyping'],
      glyph: 'experience',
    },
    {
      id: 'design-systems',
      title: 'Design Systems',
      description: 'Scalable design systems, component libraries and design consistency.',
      capabilities: ['Scalable design systems', 'Component libraries', 'Design consistency'],
      glyph: 'systems',
    },
    {
      id: 'brand-digital',
      title: 'Brand & Digital Experiences',
      description: 'Brand identity, digital experiences and high-performance websites.',
      capabilities: ['Brand identity', 'Digital experiences', 'High-performance websites'],
      glyph: 'brand',
    },
  ] as Service[],
};

/* ───────────────────────── Section 07 — About the founder ───────────────────────── */

export const about = {
  index: '06',
  label: 'About the founder',
  headline: 'Behind every great product is a point of view.',
  highlight: ['point', 'of', 'view.'],
  intro: [
    "I'm Naman Rampal, founder and creative mind behind DeepVibe. For more than 15 years I've designed complex digital products — from hiring and assessment platforms to logistics, gaming and marketing automation.",
    'I care about the place where technology meets people. Every engagement starts with understanding the problem deeply, then thinking strategically and solving it creatively — in close collaboration with founders, product leaders and engineering teams, to build products that mean something.',
  ],
  facts: [
    { label: 'Experience', value: '15+ years in product design' },
    { label: 'Focus', value: 'Complex digital products' },
    { label: 'Belief', value: 'Technology, designed around people' },
    { label: 'Way of working', value: 'Strategic, creative, collaborative' },
  ],
  portrait: { webp: '/images/founder-portrait.webp', jpg: '/images/founder-portrait.jpg' },
  cta: { label: 'Connect with Naman', href: '#contact' },
  /** TODO: e.g. 'https://www.linkedin.com/in/…' — shown as a secondary link when set. */
  linkedin: null as string | null,
};

/* ───────────────────────── Section 08 — Social proof ───────────────────────── */

export type Testimonial = { quote: string; name: string; role: string; company: string; avatar?: string };
export type ClientMark = { name: string; /** optional logo file in /public/images/logos */ logo?: string };

export const proof = {
  index: '07',
  label: 'Proof',
  headline: 'Outcomes, not just outputs.',
  highlight: ['Outcomes,'],
  /** Companies Naman has designed for (from Selected Work). Rendered as wordmarks until logo files are added. */
  experienceWith: [
    { name: 'Naukri' },
    { name: 'HackerEarth' },
    { name: 'CoinPoker' },
    { name: 'Insider' },
    { name: 'TruckX' },
    { name: 'Betaout' },
  ] as ClientMark[],
  /** Verified client testimonials only. The testimonial block stays hidden while this is empty. */
  testimonials: [] as Testimonial[],
};

/* ───────────────────────── Section 09 — Final CTA / enquiry ───────────────────────── */

export const contact = {
  index: '08',
  label: 'Start a project',
  headline: 'Something ambitious on your mind?',
  highlight: ['ambitious'],
  sub: "Let's turn your next big idea into something meaningful.",
  cta: "Let's talk about your project",
};
