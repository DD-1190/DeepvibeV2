'use client';

import { ArrowUp, ArrowUpRight } from 'lucide-react';
import { site } from '@/data/site';
import { RollText } from '@/components/ui/RollText';
import { Logo } from '@/components/ui/Logo';

type FooterLink = { label: string; href: string; external?: boolean; chat?: boolean };

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Explore',
    links: [
      { label: 'Work', href: '#work' },
      { label: 'Capabilities', href: '#services' },
      { label: 'Approach', href: '#philosophy' },
    ],
  },
  {
    title: 'Studio',
    links: [
      { label: 'About', href: '#about' },
      { label: 'Founder', href: '#top' },
      { label: 'Clients', href: '#proof' },
    ],
  },
  {
    title: 'Connect',
    links: [
      ...site.socials.map((s) => ({ label: s.label, href: s.href, external: true })),
      ...(site.email ? [{ label: 'Email', href: `mailto:${site.email}`, external: true }] : []),
      { label: 'Start a project', href: '#contact', chat: true },
    ],
  },
];

const PILLARS = ['Product thinking', 'Emerging technology', 'Experience design'];

/** The D-chevron mark (Bone + Signal Lime). */
function Mark({ size = 56 }: { size?: number }) {
  return (
    <svg viewBox="0 0 512 512" width={size} height={size} aria-hidden className="shrink-0">
      <path fill="#B9F56B" d="M176 329 L368 329 C386 355 388 400 373 432 L335 475 Q302 512 252 512 L0 512 Z" />
      <path
        fill="#F3F4EF"
        d="M0 0 L290 0 Q344 0 382 38 L477 133 Q509 165 509 210 L509 235 Q509 280 479 314 L373 432 C388 400 386 355 368 329 C360 300 345 276 313 250 Z"
      />
    </svg>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  const toTop = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    document.querySelector<HTMLElement>('#top a, #top button')?.focus({ preventScroll: true });
  };

  return (
    <footer className="relative isolate overflow-hidden pt-36 md:pt-56">
      {/* light arc, top right */}
      <svg aria-hidden className="footer-arc pointer-events-none absolute -right-[6%] top-0 -z-10 h-[150px] w-[min(1100px,92vw)] md:h-[210px]" viewBox="0 0 1100 420" fill="none" preserveAspectRatio="none">
        <defs>
          <linearGradient id="ft-arc" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#B9F56B" stopOpacity="0" />
            <stop offset="0.55" stopColor="#B9F56B" stopOpacity="0.55" />
            <stop offset="0.72" stopColor="#E9F9CF" stopOpacity="0.95" />
            <stop offset="1" stopColor="#B9F56B" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="ft-arc2" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#B9F56B" stopOpacity="0" />
            <stop offset="0.6" stopColor="#B9F56B" stopOpacity="0.35" />
            <stop offset="1" stopColor="#B9F56B" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="ft-glow" cx="0.72" cy="0.55" r="0.42">
            <stop offset="0" stopColor="#B9F56B" stopOpacity="0.12" />
            <stop offset="1" stopColor="#B9F56B" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1100" height="420" fill="url(#ft-glow)" />
        <path d="M80 330 C 380 190, 720 110, 1100 70" stroke="url(#ft-arc)" strokeWidth="1.5" />
        <path d="M80 330 C 380 190, 720 110, 1100 70" stroke="url(#ft-arc)" strokeWidth="8" opacity="0.18" style={{ filter: 'blur(6px)' }} />
        <path d="M560 420 C 600 280, 700 140, 900 0" stroke="url(#ft-arc2)" strokeWidth="1" />
      </svg>

      <div className="container-dv">
        <div className="grid gap-y-14 lg:grid-cols-12 lg:gap-x-8">
          {/* brand */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-6">
              <Mark size={52} />
              <span aria-hidden className="h-12 w-px bg-white/15" />
              <Logo height={34} />
            </div>
            <p className="mt-8 max-w-[34ch] text-[1.0625rem] leading-relaxed text-muted md:text-lg">
              An independent studio that brings together product strategy, design and emerging technology to create new opportunities for businesses.
            </p>
            <p className="label mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-warm/75">
              <span aria-hidden className="h-2.5 w-2.5 bg-lime" />
              Independent studio
              <span aria-hidden className="h-1 w-1 rounded-full bg-lime" />
              Working globally
            </p>
          </div>

          {/* link columns */}
          <nav aria-label="Footer" className="grid grid-cols-2 gap-y-10 sm:grid-cols-3 lg:col-span-7">
            {COLUMNS.map((col, ci) => (
              <div key={col.title} className={ci > 0 ? 'sm:border-l sm:border-white/[0.08] sm:pl-8 lg:pl-10' : 'lg:border-l lg:border-white/[0.08] lg:pl-10'}>
                <p className="label mb-6 text-warm/70">{col.title}</p>
                <ul className="flex flex-col gap-2">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        {...(l.external && !l.href.startsWith('mailto:') ? { target: '_blank', rel: 'noreferrer' } : {})}
                        {...(l.chat ? { 'data-open-chat': '' } : {})}
                        className="group inline-flex min-h-[2.75rem] items-center gap-2 font-display text-xl font-medium tracking-[-0.01em] text-warm transition-colors duration-300 hover:text-lime md:text-[1.375rem]"
                      >
                        <RollText>{l.label}</RollText>
                        {(l.external || l.chat) && (
                          <ArrowUpRight size={18} className="transition-transform duration-500 ease-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* divider with a lime light running in from the left */}
        <div aria-hidden className="relative mt-16 h-px bg-white/[0.08] md:mt-24">
          <span className="absolute left-0 top-0 h-px w-[45%] bg-gradient-to-r from-lime/0 via-lime/80 to-lime/0" />
          <span className="absolute left-[8%] top-[-3px] h-[7px] w-[30%] bg-gradient-to-r from-lime/0 via-lime/25 to-lime/0 blur-[4px]" />
        </div>

        <div className="flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between md:py-10">
          <ul className="flex flex-col gap-2 text-[0.9375rem] text-warm/85 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5">
            {PILLARS.map((p, i) => (
              <li key={p} className="flex items-center gap-5">
                {i > 0 && <span aria-hidden className="hidden h-1 w-1 rounded-full bg-lime sm:block" />}
                {p}
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between gap-8 md:justify-end lg:gap-14">
            <p className="text-sm text-muted md:border-l md:border-white/[0.1] md:pl-8 lg:pl-14">
              © {year} {site.name}. All rights reserved.
            </p>
            <button type="button" onClick={toTop} className="group flex items-center gap-4 text-warm">
              <span className="hidden text-[0.9375rem] transition-colors group-hover:text-lime sm:inline">Back to top</span>
              <span className="grid h-14 w-14 place-items-center rounded-full border border-white/20 transition-all duration-500 ease-expo group-hover:-translate-y-1 group-hover:border-lime group-hover:bg-lime group-hover:text-void">
                <span className="relative block h-[18px] w-[18px] overflow-hidden">
                  <ArrowUp size={18} className="absolute inset-0 transition-transform duration-500 ease-expo group-hover:-translate-y-full" />
                  <ArrowUp size={18} className="absolute inset-0 translate-y-full transition-transform duration-500 ease-expo group-hover:translate-y-0" />
                </span>
              </span>
              <span className="sr-only sm:hidden">Back to top</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
