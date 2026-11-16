'use client';

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { site } from '@/data/site';
import { MagneticButton } from '@/components/ui/MagneticButton';

const EASE = [0.16, 1, 0.3, 1] as const;

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const firstLink = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    const opener = document.activeElement as HTMLElement | null; // the Menu button
    root.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const t = window.setTimeout(() => firstLink.current?.focus({ preventScroll: true }), 350);
    // Close if the viewport grows past mobile.
    const mq = window.matchMedia('(min-width: 768px)');
    const onMq = () => mq.matches && onClose();
    mq.addEventListener('change', onMq);
    return () => {
      root.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
      mq.removeEventListener('change', onMq);
      window.clearTimeout(t);
      // return focus to the Menu button (unless a link moved it elsewhere)
      if (opener && document.activeElement?.closest('#mobile-menu')) opener.focus({ preventScroll: true });
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
          animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
          transition={{ duration: 0.75, ease: EASE }}
          className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-void md:hidden"
        >
          {/* ambient light */}
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-1/3 -top-1/4 h-[70vh] w-[90vw] rounded-full bg-lime/[0.12] blur-[90px]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(233,237,229,0.04)_1px,transparent_1px)] bg-[size:25%_100%]" />
          </div>

          <div className="container-dv relative flex flex-1 flex-col pb-8 pt-28">
            <p className="label mb-6 text-muted">Navigation</p>
            <ul className="flex flex-col">
              {site.nav.map((item, i) => (
                <li key={item.href} className="overflow-hidden border-b border-white/[0.08]">
                  <motion.a
                    ref={i === 0 ? firstLink : undefined}
                    href={item.href}
                    onClick={onClose}
                    initial={{ y: '105%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '105%', transition: { duration: 0.3 } }}
                    transition={{ duration: 0.9, ease: EASE, delay: 0.18 + i * 0.07 }}
                    className="group flex items-center justify-between py-4"
                  >
                    <span className="flex items-baseline gap-4">
                      <span className="font-mono text-xs text-lime">0{i + 1}</span>
                      <span className="font-display text-[clamp(2.75rem,13vw,4.5rem)] font-medium leading-none tracking-[-0.04em] text-warm">
                        {item.label}
                      </span>
                    </span>
                    <ArrowUpRight className="text-muted transition-colors group-active:text-lime" size={28} strokeWidth={1.5} />
                  </motion.a>
                </li>
              ))}
            </ul>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.5 }}
              className="mt-auto flex flex-col gap-6 pt-12"
            >
              <MagneticButton href={site.cta.href} onClick={onClose} className="w-full justify-between">
                {"Let's talk about your project"}
              </MagneticButton>
              <div className="flex items-end justify-between gap-4">
                <p className="font-display text-lg leading-tight text-warm/90">
                  We design
                  <br />
                  what comes next<span className="text-lime">.</span>
                </p>
                {(site.email || site.socials.length > 0) && (
                  <ul className="flex flex-col items-end gap-1.5 text-sm text-muted">
                    {site.email && (
                      <li>
                        <a href={`mailto:${site.email}`}>{site.email}</a>
                      </li>
                    )}
                    {site.socials.map((s) => (
                      <li key={s.href}>
                        <a href={s.href} target="_blank" rel="noreferrer">
                          {s.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
