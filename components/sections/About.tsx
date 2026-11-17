'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ArrowUpRight } from 'lucide-react';
import { about, site } from '@/data/site';
import { useSectionReveal } from '@/hooks/useSectionReveal';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { RollText } from '@/components/ui/RollText';

export function About() {
  const root = useRef<HTMLElement>(null);

  useSectionReveal(root, () => {
    // portrait: mask reveal, then gentle parallax
    gsap
      .timeline({ scrollTrigger: { trigger: '[data-about-portrait]', start: 'top 85%' } })
      .fromTo('[data-about-mask]', { clipPath: 'inset(100% 0% 0% 0% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: 1.5, ease: 'expo.inOut' })
      .fromTo('[data-about-img]', { scale: 1.3 }, { scale: 1.08, duration: 2, ease: 'expo.out' }, 0);
    gsap.fromTo(
      '[data-about-img]',
      { yPercent: -4 },
      { yPercent: 4, ease: 'none', scrollTrigger: { trigger: '[data-about-portrait]', start: 'top bottom', end: 'bottom top', scrub: true } },
    );
  });

  return (
    <section ref={root} id="about" aria-labelledby="about-title" className="relative scroll-mt-24 py-24 md:py-28 lg:py-36">
      <div className="container-dv">
        <SectionHeader
          id="about-title"
          index={about.index}
          label={about.label}
          headline={about.headline}
          highlight={about.highlight}
          headlineClassName="max-w-[16ch]"
        />

        <div className="mt-16 grid grid-cols-1 gap-14 md:mt-24 lg:grid-cols-12 lg:gap-10">
          {/* portrait */}
          <figure data-about-portrait className="relative mx-auto w-full max-w-[520px] self-start lg:col-span-5 lg:max-w-none">
            <div aria-hidden className="absolute inset-0 -translate-x-3 translate-y-3 rounded-[28px] border border-white/[0.07] md:-translate-x-5 md:translate-y-5" />
            <div
              data-about-mask
              className="about-mask group relative isolate aspect-[4/5] overflow-hidden rounded-[28px] border border-white/10 bg-graphite [-webkit-mask-image:-webkit-radial-gradient(white,black)]"
            >
              <picture>
                <source srcSet={about.portrait.webp} type="image/webp" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  data-about-img
                  src={about.portrait.jpg}
                  alt={`Portrait of ${site.founder.name}`}
                  width={1080}
                  height={1350}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full scale-[1.08] object-cover object-[50%_18%] grayscale transition-[filter] duration-[1200ms] ease-expo group-hover:grayscale-0 motion-reduce:grayscale-0"
                />
              </picture>
              <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(11,13,15,0.85)_100%)]" />
              {(['left-4 top-4 border-l border-t', 'right-4 top-4 border-r border-t', 'left-4 bottom-4 border-l border-b', 'right-4 bottom-4 border-r border-b'] as const).map((pos) => (
                <span key={pos} aria-hidden className={`pointer-events-none absolute h-4 w-4 border-lime/60 ${pos}`} />
              ))}
              <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6 md:p-7">
                <div>
                  <p className="font-display text-xl font-medium tracking-[-0.02em] text-warm">{site.founder.name}</p>
                  <p className="label mt-1.5 text-muted">Founder, DeepVibe</p>
                </div>
                <span className="label text-lime">15+ yrs</span>
              </figcaption>
            </div>
          </figure>

          {/* story */}
          <div className="flex flex-col lg:col-span-6 lg:col-start-7 lg:pt-6">
            <p data-reveal className="font-display text-[1.5rem] leading-[1.25] tracking-[-0.02em] text-warm md:text-[2rem]">
              {about.intro[0]}
            </p>
            <p data-reveal className="mt-8 max-w-[54ch] text-base leading-relaxed text-muted md:text-lg">
              {about.intro[1]}
            </p>

            <dl data-reveal-group className="mt-12 grid grid-cols-1 border-t border-white/[0.08] sm:grid-cols-2">
              {about.facts.map((f, i) => (
                <div
                  key={f.label}
                  className={`border-b border-white/[0.08] py-6 ${i % 2 === 1 ? 'sm:border-l sm:pl-6' : 'sm:pr-6'}`}
                >
                  <dt className="label text-muted">{f.label}</dt>
                  <dd className="mt-3 font-display text-lg font-medium tracking-[-0.02em] text-warm md:text-xl">{f.value}</dd>
                </div>
              ))}
            </dl>

            <div data-reveal className="mt-12 flex flex-wrap items-center gap-6">
              <MagneticButton href={about.cta.href} openChat>{about.cta.label}</MagneticButton>
              {about.linkedin && (
                <a
                  href={about.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-2 font-display text-[0.8125rem] font-medium uppercase tracking-[0.08em] text-warm hover:text-lime"
                >
                  <RollText>LinkedIn</RollText>
                  <ArrowUpRight size={16} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
