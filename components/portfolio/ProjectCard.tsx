'use client';

import { ArrowUpRight } from 'lucide-react';
import type { Project } from '@/data/site';
import { cn } from '@/lib/cn';

type Props = { project: Project; index: number; className?: string };

/**
 * Reusable portfolio card.
 * - masked image reveal + parallax are driven by the parent section (data-work-* hooks)
 * - desktop: the global CustomCursor turns into "VIEW ↗" over the visual (data-cursor="view")
 * - touch: a static arrow button replaces the bubble
 */
export function ProjectCard({ project: p, index, className }: Props) {
  const href = p.caseStudyHref ?? '#contact';
  const cta = p.caseStudyHref ? 'View case study' : 'Case study on request';
  const num = String(index + 1).padStart(2, '0');
  const large = p.size === 'large';
  // no public case study yet → the link opens the project assistant with the request noted
  const chat = p.caseStudyHref ? {} : { 'data-open-chat': '', 'data-chat-note': `Case study requested: ${p.name}` };

  return (
    <article id={`work-${p.slug}`} data-work-card className={cn('group/card scroll-mt-28', className)}>
      {/* visual */}
      <a
        href={href}
        tabIndex={-1}
        aria-hidden
        data-cursor="view"
        {...chat}
        className="relative block overflow-hidden rounded-[22px] border border-white/[0.08] bg-graphite md:rounded-[28px]"
      >
        <div data-work-mask className={cn('relative aspect-[4/3] w-full', large ? 'lg:aspect-[16/10]' : 'lg:aspect-[4/3]')}>
          <div data-work-parallax className="absolute inset-0 scale-[1.12] will-change-transform">
            <picture>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.image.src900}
                srcSet={`${p.image.src900} 900w, ${p.image.src1600} 1600w`}
                sizes={large ? '(min-width: 1024px) 58vw, 100vw' : '(min-width: 1024px) 42vw, 100vw'}
                alt={p.image.alt}
                width={p.image.width}
                height={p.image.height}
                loading="lazy"
                decoding="async"
                style={{ objectPosition: p.image.position ?? '50% 50%' }}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-expo group-hover/card:scale-[1.06] motion-reduce:transition-none"
              />
            </picture>
          </div>

          {/* legibility + depth */}
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(11,13,15,0.35)_0%,transparent_28%,transparent_70%,rgba(11,13,15,0.35)_100%)]" />
          <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgba(233,237,229,0.06)]" />

          {/* top meta */}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 md:p-5">
            <span className="glass label rounded-full px-3 py-2 text-warm">
              <span className="text-lime">{num}</span>
              <span className="mx-2 text-white/25">/</span>
              {p.client}
            </span>
          </div>

          {/* touch affordance */}
          <span
            aria-hidden
            className="absolute bottom-4 right-4 grid h-11 w-11 place-items-center rounded-full bg-lime text-void [@media(hover:hover)_and_(pointer:fine)]:hidden"
          >
            <ArrowUpRight size={18} />
          </span>
        </div>
      </a>

      {/* meta */}
      <div
        data-work-meta
        className="mt-6 flex flex-col gap-6 md:mt-7"
      >
        <div className="min-w-0">
          <p className="label leading-relaxed text-muted">{p.category.join('  ·  ')}</p>
          <h3 className="mt-3 font-display text-[1.75rem] font-medium leading-[1.05] tracking-[-0.03em] text-warm md:text-[2.125rem]">
            <a href={href} {...chat} className="group/title relative inline-flex items-start gap-2 transition-colors duration-500 hover:text-lime">
              {p.name}
              <ArrowUpRight
                aria-hidden
                size={22}
                className="mt-1 shrink-0 text-muted transition-all duration-500 ease-expo group-hover/title:-translate-y-0.5 group-hover/title:translate-x-0.5 group-hover/title:text-lime"
              />
              <span className="sr-only">— {cta}</span>
            </a>
          </h3>
          <p className="mt-4 max-w-[48ch] text-[0.975rem] leading-relaxed text-muted md:text-base">{p.summary}</p>
        </div>

        <dl
          className={cn(
            'grid gap-x-10 gap-y-6 border-t border-white/[0.08] pt-6',
            p.metrics.length > 1 ? 'grid-cols-2' : 'grid-cols-1',
          )}
        >
          {p.metrics.map((m) => (
            <div key={m.label} className="flex flex-col-reverse gap-3 sm:flex-row-reverse sm:items-end sm:justify-end sm:gap-5">
              <dt className="label max-w-[24ch] pb-1 leading-[1.45] text-muted">{m.label}</dt>
              <dd className="shrink-0 font-display text-[2.25rem] font-medium leading-none tracking-[-0.045em] text-lime md:text-[2.75rem]">
                {m.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </article>
  );
}
