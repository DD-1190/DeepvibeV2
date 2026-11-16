'use client';

import { RefObject, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

/**
 * Shared scroll entrances:
 *  - SectionHeader (data-sh-label / data-sh-rule / data-sh-word)
 *  - [data-reveal]        → fade + rise when it enters
 *  - [data-reveal-group]  → its direct children stagger in
 * `extra` runs inside the same gsap.context for section-specific motion.
 */
export function useSectionReveal(root: RefObject<HTMLElement | null>, extra?: (el: HTMLElement) => void) {
  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      const st = { trigger: el, start: 'top 80%' };
      gsap.fromTo('[data-sh-rule]', { scaleX: 0 }, { scaleX: 1, duration: 1.6, ease: 'expo.inOut', scrollTrigger: st });
      gsap.fromTo('[data-sh-label]', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', scrollTrigger: st });
      gsap.fromTo(
        '[data-sh-word]',
        { y: 0, yPercent: 110, rotate: 3 },
        { y: 0, yPercent: 0, rotate: 0, duration: 1.3, ease: 'expo.out', stagger: 0.05, scrollTrigger: { trigger: '[data-sh-title]', start: 'top 85%' } },
      );
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((n) => {
        gsap.fromTo(n, { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: n, start: 'top 88%' } });
      });
      gsap.utils.toArray<HTMLElement>('[data-reveal-group]').forEach((g) => {
        gsap.fromTo(
          g.children,
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: g, start: 'top 88%' } },
        );
      });
      extra?.(el);
    }, el);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
