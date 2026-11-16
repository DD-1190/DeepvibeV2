'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { site } from '@/data/site';
import { cn } from '@/lib/cn';
import { Logo } from '@/components/ui/Logo';
import { RollText } from '@/components/ui/RollText';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { MobileMenu } from './MobileMenu';
import { VibeToggle } from '@/components/ui/VibeToggle';

const EASE = [0.16, 1, 0.3, 1] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const lastY = useRef(0);
  const openRef = useRef(open);
  openRef.current = open;

  // Glass on scroll; tuck away while scrolling down, return on scroll up.
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 24);
        const delta = y - lastY.current;
        if (Math.abs(delta) > 6) setHidden(!openRef.current && delta > 0 && y > 360);
        lastY.current = y;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -32, opacity: 0 }}
        animate={{ y: hidden ? -120 : 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: EASE, delay: hidden ? 0 : 0.05 }}
        className="fixed inset-x-0 top-0 z-50 pt-3 md:pt-5"
      >
        <div className="container-dv">
          <nav
            aria-label="Primary"
            className={cn(
              '-mx-3 flex h-14 items-center justify-between rounded-full border pl-4 pr-2 transition-[background-color,border-color,box-shadow] duration-500 ease-expo md:-mx-5 md:pl-5',
              scrolled && !open ? 'glass border-white/[0.08]' : 'border-transparent bg-transparent',
            )}
          >
            <div className="flex items-center gap-3 md:gap-4">
              <Logo onClick={() => setOpen(false)} height={24} />
              <VibeToggle />
            </div>

            {/* Desktop / tablet links */}
            <ul className="hidden items-center md:flex" onMouseLeave={() => setHovered(null)}>
              {site.nav.map((item, i) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onMouseEnter={() => setHovered(item.href)}
                    onFocus={() => setHovered(item.href)}
                    onBlur={() => setHovered(null)}
                    className="group relative flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[0.875rem] font-medium text-warm/80 transition-colors duration-300 hover:text-warm"
                  >
                    {hovered === item.href && (
                      <motion.span
                        layoutId="nav-hover"
                        className="absolute inset-0 rounded-full bg-white/[0.06]"
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      />
                    )}
                    <span className="relative font-mono text-[0.625rem] text-muted/70 transition-colors group-hover:text-lime">
                      0{i + 1}
                    </span>
                    <RollText className="relative">{item.label}</RollText>
                  </a>
                </li>
              ))}
              <li className="ml-3">
                <MagneticButton href={site.cta.href} size="sm">
                  {site.cta.label}
                </MagneticButton>
              </li>
            </ul>

            {/* Mobile toggle */}
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="group relative flex h-11 items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] pl-4 pr-1.5 md:hidden"
            >
              <span className="label text-warm/90">{open ? 'Close' : 'Menu'}</span>
              <span className="relative grid h-8 w-8 place-items-center rounded-full bg-lime">
                <span
                  className={cn(
                    'absolute h-[1.5px] w-3.5 bg-void transition-transform duration-500 ease-expo',
                    open ? 'rotate-45' : '-translate-y-[3px]',
                  )}
                />
                <span
                  className={cn(
                    'absolute h-[1.5px] w-3.5 bg-void transition-transform duration-500 ease-expo',
                    open ? '-rotate-45' : 'translate-y-[3px]',
                  )}
                />
              </span>
            </button>
          </nav>
        </div>
      </motion.header>

      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </>
  );
}
