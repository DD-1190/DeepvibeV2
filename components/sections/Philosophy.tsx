'use client';

import { Fragment, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { philosophy } from '@/data/site';
import { cn } from '@/lib/cn';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

const words = philosophy.headline.split(' ');
const DIM = 'rgba(233, 237, 229, 0.3)';

/** Supporting line with each principle word emphasised. */
function SubLine() {
  const keys = philosophy.principles.map((p) => p.toLowerCase());
  return (
    <>
      {philosophy.sub.split(/(\s+)/).map((tok, i) => {
        const hit = keys.includes(tok.replace(/[.,]/g, '').toLowerCase());
        return <Fragment key={i}>{hit ? <span className="text-warm">{tok}</span> : tok}</Fragment>;
      })}
    </>
  );
}

export function Philosophy() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      // 1 — headline lights up word by word, tied to scroll position
      gsap.fromTo(
        '[data-phil-word]',
        { color: DIM },
        {
          color: (_i: number, target: HTMLElement) => (target.dataset.hl ? '#B9F56B' : '#E9EDE5'),
          ease: 'none',
          stagger: 0.12,
          scrollTrigger: { trigger: '[data-phil-title]', start: 'top 82%', end: 'bottom 45%', scrub: 0.6 },
        },
      );

      // 2 — chrome form: parallax drift + slow turn
      gsap.fromTo(
        '[data-phil-visual]',
        { yPercent: 18, rotate: -10 },
        {
          yPercent: -14,
          rotate: 8,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );

      // 3 — label + rule
      gsap.fromTo(
        '[data-phil-label]',
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 80%' } },
      );
      gsap.fromTo(
        '[data-phil-rule]',
        { scaleX: 0 },
        { scaleX: 1, duration: 1.6, ease: 'expo.inOut', scrollTrigger: { trigger: el, start: 'top 80%' } },
      );

      // 4 — supporting line, then principles
      gsap.fromTo(
        '[data-phil-sub]',
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '[data-phil-sub]', start: 'top 88%' } },
      );
      gsap.fromTo(
        '[data-phil-item]',
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          ease: 'expo.out',
          stagger: 0.09,
          scrollTrigger: { trigger: '[data-phil-list]', start: 'top 90%' },
        },
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="philosophy"
      aria-labelledby="philosophy-title"
      className="relative isolate overflow-hidden pb-16 pt-24 md:pb-20 md:pt-28 lg:pb-24 lg:pt-32"
    >
      {/* ambient light */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute right-[-10%] top-[5%] h-[50vmax] w-[50vmax] rounded-full bg-[radial-gradient(circle,rgba(185,245,107,0.06),transparent_62%)]" />
      </div>

      <div className="container-dv relative">
        {/* section label */}
        <div data-phil-label className="phil-pre relative z-10 mb-10 flex items-center gap-5 md:mb-16">
          <span className="label text-lime">{philosophy.index}</span>
          <span data-phil-rule className="h-px flex-1 origin-left bg-gradient-to-r from-white/20 via-white/10 to-transparent" />
          <span className="label text-muted">{philosophy.label}</span>
        </div>

        {/* liquid-chrome form (pre-rendered, see scripts/render-chrome.py) */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-[22%] top-8 w-[86vw] max-w-[760px] sm:-right-[12%] md:top-10 md:w-[62vw] lg:-right-[6%] lg:top-0 lg:w-[50vw] xl:-right-[2%] xl:w-[46vw]"
        >
          <div data-phil-visual className="will-change-transform">
            <div className="animate-float motion-reduce:animate-none">
              <picture>
                <source srcSet={philosophy.visual.webp} type="image/webp" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={philosophy.visual.png}
                  alt=""
                  width={philosophy.visual.width}
                  height={philosophy.visual.height}
                  loading="lazy"
                  decoding="async"
                  className="h-auto w-full [filter:drop-shadow(0_40px_80px_rgba(0,0,0,0.6))]"
                />
              </picture>
            </div>
          </div>
        </div>

        {/* headline */}
        <h2
          id="philosophy-title"
          data-phil-title
          className="relative z-10 max-w-[12ch] pt-[44vw] font-display text-[clamp(3rem,1.1rem+7.2vw,9.25rem)] font-medium leading-[0.92] tracking-[-0.05em] text-warm sm:pt-[34vw] md:pt-[26vw] lg:pt-[9vw]"
        >
          {words.map((w, i) => {
            const hl = philosophy.highlight.includes(w);
            return (
              <Fragment key={i}>
                <span data-phil-word data-hl={hl ? '1' : undefined} className={cn('phil-word inline-block', hl && 'text-lime')}>
                  {w}
                </span>
                {i < words.length - 1 && ' '}
              </Fragment>
            );
          })}
        </h2>

        {/* supporting line */}
        <div className="relative z-10 mt-14 grid grid-cols-1 md:mt-20 lg:grid-cols-12">
          <p
            data-phil-sub
            className="phil-pre max-w-[28ch] font-display text-[1.5rem] leading-[1.22] tracking-[-0.02em] text-muted sm:text-[1.75rem] md:text-[2.25rem] lg:col-span-7 lg:col-start-6"
          >
            <SubLine />
          </p>
        </div>

        {/* principles */}
        <ul data-phil-list className="relative z-10 mt-16 grid grid-cols-2 border-t border-white/[0.08] md:mt-24 lg:grid-cols-4">
          {philosophy.principles.map((p, i) => (
            <li
              key={p}
              data-phil-item
              className={cn(
                'phil-pre group relative border-white/[0.08] py-7 md:py-9 lg:py-10',
                i === 0 && 'pr-4 lg:pl-0',
                i === 2 && 'pr-4 lg:border-l lg:pl-6',
                i % 2 === 1 && 'border-l pl-5 md:pl-8 lg:pl-6',
                i < 2 && 'border-b lg:border-b-0',
              )}
            >
              <span aria-hidden className="absolute left-0 top-[-1px] h-px w-0 bg-lime transition-[width] duration-700 ease-expo group-hover:w-full" />
              <span className="label text-lime/80">0{i + 1}</span>
              <p className="mt-6 font-display text-[1.375rem] font-medium tracking-[-0.03em] text-warm transition-colors duration-500 group-hover:text-lime sm:text-2xl md:mt-10 md:text-[1.75rem] xl:text-[2rem]">
                {p}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
