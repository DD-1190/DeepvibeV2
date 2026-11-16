'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { services } from '@/data/site';
import { cn } from '@/lib/cn';
import { ServiceGlyph } from '@/components/services/ServiceGlyph';
import { MagneticButton } from '@/components/ui/MagneticButton';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

const EASE = [0.16, 1, 0.3, 1] as const;
const words = services.headline.split(' ');

export function Services() {
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<string | null>(services.items[0].id);

  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('[data-svc-rule]', { scaleX: 0 }, { scaleX: 1, duration: 1.6, ease: 'expo.inOut', scrollTrigger: { trigger: el, start: 'top 80%' } });
      gsap.fromTo('[data-svc-label]', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 80%' } });
      gsap.fromTo(
        '[data-svc-word]',
        { y: 0, yPercent: 110, rotate: 3 },
        { y: 0, yPercent: 0, rotate: 0, duration: 1.3, ease: 'expo.out', stagger: 0.05, scrollTrigger: { trigger: '[data-svc-title]', start: 'top 85%' } },
      );
      gsap.fromTo(
        '[data-svc-row]',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: '[data-svc-list]', start: 'top 85%' } },
      );
      gsap.fromTo('[data-svc-row-rule]', { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: 'expo.inOut', stagger: 0.1, scrollTrigger: { trigger: '[data-svc-list]', start: 'top 85%' } });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="services" aria-labelledby="services-title" className="relative scroll-mt-24 overflow-hidden py-24 md:py-28 lg:py-36">
      {/* ambient */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-15%] top-[30%] h-[45vmax] w-[45vmax] rounded-full bg-[radial-gradient(circle,rgba(185,245,107,0.05),transparent_62%)]" />
      </div>

      <div className="container-dv">
        {/* label */}
        <div data-svc-label className="svc-pre mb-10 flex items-center gap-5 md:mb-16">
          <span className="label text-lime">{services.index}</span>
          <span data-svc-rule className="h-px flex-1 origin-left bg-gradient-to-r from-white/20 via-white/10 to-transparent" />
          <span className="label text-muted">{services.label}</span>
        </div>

        {/* header */}
        <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-12">
          <h2
            id="services-title"
            data-svc-title
            className="max-w-[14ch] font-display text-[clamp(2.75rem,1rem+6vw,7.5rem)] font-medium leading-[0.95] tracking-[-0.05em] text-warm lg:col-span-9"
          >
            {words.map((w, i) => (
              <span key={i} className="-mb-[0.1em] inline-block overflow-hidden pb-[0.1em] align-top">
                <span data-svc-word className={cn('inline-block origin-bottom-left', services.highlight.includes(w) && 'text-lime')}>
                  {w}
                </span>
                {i < words.length - 1 && ' '}
              </span>
            ))}
          </h2>
          <div className="hidden lg:col-span-3 lg:flex lg:justify-end lg:pb-4">
            <span className="label text-muted">
              {String(services.items.length).padStart(2, '0')} disciplines
            </span>
          </div>
        </div>

        {/* panels */}
        <ul data-svc-list className="mt-16 md:mt-24">
          {services.items.map((s, i) => {
            const isOpen = open === s.id;
            const num = String(i + 1).padStart(2, '0');
            return (
              <li key={s.id} data-svc-row className="svc-pre relative">
                <span data-svc-row-rule aria-hidden className="absolute inset-x-0 top-0 h-px origin-left bg-white/[0.1]" />
                {/* lime progress line on the open row */}
                <motion.span
                  aria-hidden
                  className="absolute left-0 top-0 h-px bg-lime"
                  initial={false}
                  animate={{ width: isOpen ? '100%' : '0%' }}
                  transition={{ duration: 0.9, ease: EASE }}
                />

                <h3>
                  <button
                    type="button"
                    id={`svc-btn-${s.id}`}
                    aria-expanded={isOpen}
                    aria-controls={`svc-panel-${s.id}`}
                    onClick={() => setOpen(isOpen ? null : s.id)}
                    className="group grid w-full grid-cols-[auto_1fr_auto] items-center gap-x-5 py-7 text-left md:grid-cols-12 md:gap-x-6 md:py-9 lg:py-10"
                  >
                    <span className={cn('label transition-colors duration-500 md:col-span-1', isOpen ? 'text-lime' : 'text-muted group-hover:text-lime')}>
                      {num}
                    </span>
                    <span
                      className={cn(
                        'font-display text-[1.75rem] font-medium leading-[1.05] tracking-[-0.035em] transition-[color,transform] duration-500 ease-expo sm:text-[2.25rem] md:col-span-6 md:text-[2.75rem] lg:text-[3.5rem]',
                        isOpen ? 'text-warm' : 'text-warm/55 group-hover:translate-x-2 group-hover:text-warm',
                      )}
                    >
                      {s.title}
                    </span>
                    <span className="hidden text-base leading-relaxed text-muted md:col-span-4 md:block lg:text-[1.0625rem]">
                      {s.description}
                    </span>
                    <span className="flex justify-end md:col-span-1">
                      <span
                        className={cn(
                          'grid h-11 w-11 place-items-center rounded-full border transition-all duration-500 ease-expo md:h-12 md:w-12',
                          isOpen ? 'rotate-45 border-lime bg-lime text-void' : 'border-white/15 text-warm group-hover:border-lime group-hover:text-lime',
                        )}
                      >
                        <Plus size={18} strokeWidth={1.75} />
                      </span>
                    </span>
                  </button>
                </h3>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`svc-panel-${s.id}`}
                      role="region"
                      aria-labelledby={`svc-btn-${s.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ height: { duration: 0.75, ease: EASE }, opacity: { duration: 0.4 } }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 gap-10 pb-12 md:grid-cols-12 md:gap-6 md:pb-14">
                        <div className="md:col-span-5 md:col-start-2">
                          <p className="text-base leading-relaxed text-muted md:hidden">{s.description}</p>
                          <p className="label mb-5 mt-8 text-muted md:mt-0">Capabilities</p>
                          <ul className="flex flex-wrap gap-2.5">
                            {s.capabilities.map((c, ci) => (
                              <motion.li
                                key={c}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, ease: EASE, delay: 0.15 + ci * 0.06 }}
                                className="rounded-full border border-white/[0.12] bg-white/[0.03] px-4 py-2.5 text-sm text-warm"
                              >
                                {c}
                              </motion.li>
                            ))}
                          </ul>
                          <div className="mt-10">
                            <MagneticButton href={services.cta.href} size="sm">
                              {services.cta.label}
                            </MagneticButton>
                          </div>
                        </div>

                        <motion.div
                          initial={{ opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
                          className="relative overflow-hidden rounded-[22px] border border-white/[0.08] bg-graphite/60 p-6 md:col-span-6 md:p-8"
                        >
                          <div
                            aria-hidden
                            className="absolute inset-0 bg-[linear-gradient(to_right,rgba(233,237,229,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(233,237,229,0.035)_1px,transparent_1px)] bg-[size:24px_24px]"
                          />
                          <div className="relative flex items-center justify-between">
                            <span className="label text-muted">{num} / {s.title}</span>
                            <span className="h-1.5 w-1.5 animate-blink rounded-full bg-lime motion-reduce:animate-none" />
                          </div>
                          <div className="relative mt-4">
                            <ServiceGlyph type={s.glyph} />
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
          <li aria-hidden className="h-px bg-white/[0.1]" />
        </ul>
      </div>
    </section>
  );
}
