'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { Quote } from 'lucide-react';
import { proof, work } from '@/data/site';
import { useSectionReveal } from '@/hooks/useSectionReveal';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { DragMarquee } from '@/components/ui/DragMarquee';

/** Verified outcomes = achieved (non-target) metrics from Selected Work. */
const outcomes = work.projects.flatMap((p) =>
  p.metrics.filter((m) => m.kind !== 'target').map((m) => ({ ...m, project: p.name, slug: p.slug })),
);

/** Split "+1,600" → prefix "+", number 1600, suffix "" so it can count up. */
function parseValue(v: string) {
  const m = v.match(/^([^\d]*)([\d,]+)(.*)$/);
  if (!m) return null;
  return { prefix: m[1], n: Number(m[2].replace(/,/g, '')), suffix: m[3], comma: m[2].includes(',') };
}

export function Proof() {
  const root = useRef<HTMLElement>(null);

  useSectionReveal(root, () => {
    // count-up numbers
    gsap.utils.toArray<HTMLElement>('[data-count]').forEach((n) => {
      const parsed = parseValue(n.dataset.count ?? '');
      if (!parsed) return;
      const o = { v: 0 };
      gsap.to(o, {
        v: parsed.n,
        duration: 1.8,
        ease: 'expo.out',
        scrollTrigger: { trigger: n, start: 'top 90%' },
        onUpdate: () => {
          const val = Math.round(o.v);
          n.textContent = `${parsed.prefix}${parsed.comma ? val.toLocaleString('en-US') : val}${parsed.suffix}`;
        },
      });
    });
  });

  return (
    <section ref={root} id="proof" aria-labelledby="proof-title" className="relative scroll-mt-24 overflow-hidden py-24 md:py-28 lg:py-36">
      <div className="container-dv">
        <SectionHeader
          id="proof-title"
          index={proof.index}
          label={proof.label}
          headline={proof.headline}
          highlight={proof.highlight}
          headlineClassName="max-w-[14ch]"
        />

        {/* outcomes */}
        <div className="mt-16 md:mt-24">
          <p data-reveal className="label mb-6 flex justify-between text-muted">
            <span>Project outcomes</span>
            <span>From selected work</span>
          </p>
          <ul data-reveal-group className="grid grid-cols-1 gap-px border-y border-white/[0.08] bg-white/[0.08] sm:grid-cols-2 lg:grid-cols-3">
            {outcomes.map((o) => (
              <li
                key={o.project + o.label}
                className="group relative bg-void py-8 sm:px-8 sm:first:pl-0 md:py-10 sm:[&:nth-child(2n+1)]:pl-0 lg:[&:nth-child(2n+1)]:pl-8 lg:[&:nth-child(3n+1)]:pl-0"
              >
                <span aria-hidden className="absolute left-0 top-[-1px] h-px w-0 bg-lime transition-[width] duration-700 ease-expo group-hover:w-full" />
                <p
                  data-count={o.value}
                  className="font-display text-[3rem] font-medium leading-none tracking-[-0.05em] text-lime md:text-[4rem]"
                >
                  {o.value}
                </p>
                <p className="mt-5 text-base text-warm">{o.label}</p>
                <a href={`#work-${o.slug}`} className="label mt-3 inline-block text-muted transition-colors hover:text-lime">
                  {o.project} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* testimonials — rendered only when verified quotes exist in data/site.ts */}
        {proof.testimonials.length > 0 && (
          <div data-reveal-group className="mt-20 grid grid-cols-1 gap-6 md:mt-28 lg:grid-cols-2">
            {proof.testimonials.map((t) => (
              <figure key={t.name} className="glass flex flex-col justify-between rounded-[24px] border border-white/[0.08] p-8 md:p-10">
                <Quote className="text-lime" size={28} />
                <blockquote className="mt-6 font-display text-xl leading-[1.35] tracking-[-0.02em] text-warm md:text-2xl">“{t.quote}”</blockquote>
                <figcaption className="mt-8 flex items-center gap-4 border-t border-white/[0.08] pt-6">
                  {t.avatar && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.avatar} alt="" width={44} height={44} className="h-11 w-11 rounded-full object-cover" />
                  )}
                  <div>
                    <p className="font-medium text-warm">{t.name}</p>
                    <p className="label mt-1 text-muted">
                      {t.role}, {t.company}
                    </p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>

      {/* experience-with marquee */}
      <div data-reveal className="mt-20 md:mt-28">
        <div className="container-dv">
          <p className="label mb-6 text-muted">Experience designing for</p>
        </div>
        <DragMarquee className="border-y border-white/[0.08] py-8 [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)] md:py-10">
          <ul className="flex shrink-0 items-center gap-16 pr-16 md:gap-24 md:pr-24">
            {proof.experienceWith.map((c, i) => (
              <li key={i} className="flex shrink-0 items-center gap-16 md:gap-24">
                {c.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.logo} alt={c.name} draggable={false} className="h-8 w-auto opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0" />
                ) : (
                  <span className="font-display text-[2rem] font-medium tracking-[-0.04em] text-warm/40 transition-colors duration-500 hover:text-warm md:text-[2.75rem]">
                    {c.name}
                  </span>
                )}
                <span aria-hidden className="h-2 w-2 rotate-45 bg-lime/60" />
              </li>
            ))}
          </ul>
        </DragMarquee>
      </div>
    </section>
  );
}
