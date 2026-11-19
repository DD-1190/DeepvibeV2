'use client';

import { Fragment, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown } from 'lucide-react';
import { hero, site } from '@/data/site';
import { cn } from '@/lib/cn';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { RollText } from '@/components/ui/RollText';
import { HeroBackground } from './HeroBackground';
import { FounderVideo } from './FounderVideo';
import { ScrollIndicator } from './ScrollIndicator';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

const words = hero.headline.split(' ');
const isHighlight = (w: string) => hero.highlight.includes(w.replace(/[.,]/g, ''));

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      // 1 — entrance is pure CSS (globals.css → hero entrance) so it plays at first paint, before JS loads.

      // 2 — scroll parallax (desktop/laptop only)
      const mm = gsap.matchMedia();
      mm.add('(min-width: 1024px)', () => {
        gsap.to('[data-hero-copy]', {
          yPercent: -12,
          opacity: 0.25,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true },
        });
        gsap.to('[data-hero-parallax]', {
          y: 90,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true },
        });
      });
    }, el);

    // 3 — subtle cursor spotlight on the background (the photo itself stays still)
    let cleanupPointer = () => {};
    if (fine) {
      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${e.clientX - r.left}px`);
        el.style.setProperty('--my', `${e.clientY - r.top}px`);
      };
      el.addEventListener('pointermove', onMove);
      cleanupPointer = () => el.removeEventListener('pointermove', onMove);
    }

    return () => {
      cleanupPointer();
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={root}
      id="top"
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden pb-8 pt-28 md:pt-32 lg:pb-8 lg:pt-28"
    >
      <HeroBackground />

      <div className="container-dv grid flex-1 grid-cols-1 items-center gap-14 md:gap-16 lg:grid-cols-12 lg:gap-10">
        {/* ── Copy ─────────────────────────────── */}
        <div data-hero-copy className="relative z-10 lg:col-span-6">
          <p data-hero-eyebrow className="label mb-7 flex items-center gap-3 text-muted md:mb-9">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-lime/60 motion-reduce:animate-none" />
              <span className="relative h-2 w-2 rounded-full bg-lime" />
            </span>
            {hero.eyebrow}
          </p>

          <h1
            id="hero-title"
            className="max-w-[15ch] font-display text-display-xl font-medium text-warm md:text-[4.25rem] lg:text-[clamp(3.25rem,0.8rem+4.1vw,5.5rem)]"
          >
            {words.map((w, i) => (
              <Fragment key={i}>
                {/* the space sits OUTSIDE the inline-block: Safari otherwise wraps it inside the word box */}
                <span className="inline-block overflow-hidden whitespace-nowrap pb-[0.1em] align-top -mb-[0.1em]">
                  <span
                    data-hero-word
                    style={{ ['--i' as string]: i }}
                    className={cn('inline-block origin-bottom-left will-change-transform', isHighlight(w) && 'text-lime')}
                  >
                    {w}
                  </span>
                </span>
                {i < words.length - 1 && ' '}
              </Fragment>
            ))}
          </h1>

          <p data-hero-fade style={{ ['--i' as string]: 0 }} className="mt-7 max-w-[34ch] text-lg leading-relaxed text-muted md:mt-9 md:text-xl">
            {hero.sub}
          </p>

          <div data-hero-fade style={{ ['--i' as string]: 1 }} className="mt-9 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:gap-6 md:mt-11">
            <MagneticButton href={hero.primaryCta.href} openChat>{hero.primaryCta.label}</MagneticButton>
            <a
              href={hero.secondaryCta.href}
              className="group inline-flex h-14 items-center justify-center gap-3 rounded-full border border-white/10 px-6 font-display text-[0.8125rem] font-medium uppercase tracking-[0.08em] text-warm transition-colors duration-500 hover:border-white/25 hover:bg-white/[0.04] sm:justify-start sm:border-transparent sm:px-2 sm:hover:border-transparent sm:hover:bg-transparent"
            >
              <RollText>{hero.secondaryCta.label}</RollText>
              <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-full border border-white/15 transition-colors duration-500 group-hover:border-lime group-hover:text-lime">
                <ArrowDown size={14} className="animate-nudge motion-reduce:animate-none" />
              </span>
            </a>
          </div>

          <ul data-hero-fade style={{ ['--i' as string]: 2 }} className="mt-12 flex max-w-xl gap-6 border-t border-white/[0.08] pt-5 md:mt-16 md:gap-10">
            {hero.pillars.map((p, i) => (
              <li key={p} className="label flex items-baseline gap-2 text-muted">
                <span className="text-lime/80">0{i + 1}</span>
                <span className="text-warm/80">{p}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Founder film ─────────────────────── */}
        <div className="relative mx-auto w-full max-w-[520px] lg:col-span-6 lg:mr-0 lg:max-w-[min(100%,600px,calc((100svh-9.5rem)*0.8))]">
          <div data-hero-parallax className="relative">
            {/* layered depth: offset hairline frame + floor glow */}
            <div aria-hidden className="absolute -bottom-10 left-1/2 h-24 w-3/4 -translate-x-1/2 rounded-full bg-lime/20 blur-[60px]" />

            <div className="relative">
              <div
                data-hero-media
                className="hero-media-blend relative isolate aspect-[4/5] w-full overflow-hidden rounded-[28px] bg-void [transform:translateZ(0)]"
              >
                <FounderVideo />
              </div>
            </div>

            {/* vertical editorial label */}
            <p
              aria-hidden
              className="label absolute left-full top-1/2 ml-10 hidden -translate-y-1/2 whitespace-nowrap text-muted/60 [writing-mode:vertical-rl] xl:block"
            >
              {site.name} — {site.tagline.replace('.', '')}
            </p>
          </div>
        </div>
      </div>

      {/* bottom rail */}
      <div data-hero-fade style={{ ['--i' as string]: 3 }} className="container-dv mt-12 flex items-end justify-between lg:mt-10">
        <ScrollIndicator href={hero.secondaryCta.href} />
        <p className="label hidden text-muted/70 md:block">
          {site.tagline.replace('.', '')}
          <span className="text-lime">.</span>
        </p>
      </div>
    </section>
  );
}
