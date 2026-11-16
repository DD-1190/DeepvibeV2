'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDownRight } from 'lucide-react';
import { work, type Project } from '@/data/site';
import { cn } from '@/lib/cn';
import { ProjectCard } from '@/components/portfolio/ProjectCard';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

/** Pair projects into editorial rows; the large card alternates sides each row. */
function toRows(projects: Project[]) {
  const rows: Project[][] = [];
  for (let i = 0; i < projects.length; i += 2) rows.push(projects.slice(i, i + 2));
  return rows;
}

const headlineWords = work.headline.split(' ');

export function SelectedWork() {
  const root = useRef<HTMLElement>(null);
  const rows = toRows(work.projects);

  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      // header
      gsap.fromTo('[data-work-rule]', { scaleX: 0 }, { scaleX: 1, duration: 1.6, ease: 'expo.inOut', scrollTrigger: { trigger: el, start: 'top 80%' } });
      gsap.fromTo('[data-work-label]', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 80%' } });
      gsap.fromTo(
        '[data-work-word]',
        { y: 0, yPercent: 110, rotate: 3 },
        { y: 0, yPercent: 0, rotate: 0, duration: 1.3, ease: 'expo.out', stagger: 0.06, scrollTrigger: { trigger: '[data-work-title]', start: 'top 85%' } },
      );
      gsap.fromTo(
        '[data-work-index] li',
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.05, scrollTrigger: { trigger: '[data-work-index]', start: 'top 88%' } },
      );

      // cards: masked reveal, image settle, meta fade, gentle parallax
      gsap.utils.toArray<HTMLElement>('[data-work-card]').forEach((card) => {
        const mask = card.querySelector('[data-work-mask]');
        const par = card.querySelector('[data-work-parallax]');
        const meta = card.querySelector('[data-work-meta]');
        const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 88%' } });
        tl.fromTo(mask, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' })
          .fromTo(par, { scale: 1.32 }, { scale: 1.12, duration: 1.8, ease: 'expo.out' }, 0)
          .fromTo(meta, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out' }, 0.5);

        gsap.fromTo(
          par,
          { yPercent: -4 },
          { yPercent: 4, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true } },
        );
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="work" aria-labelledby="work-title" className="relative scroll-mt-24 pb-24 pt-24 md:pb-32 md:pt-28 lg:pb-40 lg:pt-32">
      <div className="container-dv">
        {/* label */}
        <div data-work-label className="work-pre mb-10 flex items-center gap-5 md:mb-16">
          <span className="label text-lime">{work.index}</span>
          <span data-work-rule className="h-px flex-1 origin-left bg-gradient-to-r from-white/20 via-white/10 to-transparent" />
          <span className="label text-muted">{work.label}</span>
        </div>

        {/* header */}
        <div className="grid grid-cols-1 items-end gap-12 lg:grid-cols-12 lg:gap-10">
          <h2
            id="work-title"
            data-work-title
            className="font-display text-[clamp(3rem,1.1rem+7.2vw,9.25rem)] font-medium leading-[0.92] tracking-[-0.05em] text-warm lg:col-span-8"
          >
            {headlineWords.map((w, i) => (
              <span key={i} className="-mb-[0.1em] inline-block overflow-hidden pb-[0.1em] align-top">
                <span data-work-word className={cn('inline-block origin-bottom-left', i === headlineWords.length - 1 && 'text-lime')}>
                  {w}
                </span>
                {i < headlineWords.length - 1 && ' '}
              </span>
            ))}
          </h2>

          {/* project index — quick navigation */}
          <nav aria-label="Projects" className="lg:col-span-4 lg:pb-3">
            <p className="label mb-4 flex justify-between text-muted">
              <span>Index</span>
              <span>{String(work.projects.length).padStart(2, '0')} projects</span>
            </p>
            <ol data-work-index className="border-t border-white/[0.08]">
              {work.projects.map((p, i) => (
                <li key={p.slug} className="work-pre border-b border-white/[0.08]">
                  <a
                    href={`#work-${p.slug}`}
                    className="group flex items-center gap-4 py-3 text-[0.9375rem] text-warm/80 transition-colors duration-300 hover:text-warm"
                  >
                    <span className="font-mono text-[0.6875rem] text-muted transition-colors group-hover:text-lime">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="flex-1 truncate transition-transform duration-500 ease-expo group-hover:translate-x-1.5">{p.client}</span>
                    <span className="label hidden text-muted/70 sm:inline">{p.category[0]}</span>
                    <ArrowDownRight
                      size={15}
                      className="-translate-x-1 text-lime opacity-0 transition-all duration-500 ease-expo group-hover:translate-x-0 group-hover:opacity-100"
                    />
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {/* editorial grid */}
        <div className="mt-20 flex flex-col gap-20 md:mt-28 md:gap-28 lg:gap-36">
          {rows.map((row, r) => {
            const largeFirst = r % 2 === 0;
            return (
              <div key={r} className="grid grid-cols-1 gap-20 md:gap-28 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-0">
                {row.map((p) => {
                  const i = work.projects.indexOf(p);
                  const large = p.size === 'large';
                  return (
                    <ProjectCard
                      key={p.slug}
                      project={p}
                      index={i}
                      className={cn(
                        large ? 'lg:col-span-7' : 'lg:col-span-5',
                        // alternate sides: row 0 & 2 → large left, row 1 → large right
                        !largeFirst && large && 'lg:order-2',
                        !largeFirst && !large && 'lg:order-1',
                        // stagger the small card for an editorial rhythm
                        !large && 'lg:mt-40',
                      )}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
