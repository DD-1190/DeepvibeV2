'use client';

import { ArrowUp, ArrowUpRight } from 'lucide-react';
import { site } from '@/data/site';
import { RollText } from '@/components/ui/RollText';
import { Logo, LogoOutline } from '@/components/ui/Logo';

export function Footer() {
  const year = new Date().getFullYear();
  const toTop = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    document.querySelector<HTMLElement>('#top a, #top button')?.focus({ preventScroll: true });
  };

  return (
    <footer className="relative overflow-hidden border-t border-white/[0.08] pt-16 md:pt-24">
      <div className="container-dv">
        <div className="grid grid-cols-2 gap-y-12 md:grid-cols-12 md:gap-x-8">
          {/* brand */}
          <div className="col-span-2 md:col-span-5">
            <Logo height={34} />
            <p className="mt-5 max-w-[36ch] leading-relaxed text-muted">
              An independent digital product design studio partnering with ambitious founders, product leaders and engineering teams.
            </p>
            <p className="label mt-8 text-warm/80">
              {site.tagline.replace('.', '')}
              <span className="text-lime">.</span>
            </p>
          </div>

          {/* navigation */}
          <nav aria-label="Footer" className="md:col-span-2 md:col-start-7">
            <p className="label mb-5 text-muted">Navigate</p>
            <ul className="flex flex-col gap-1">
              {site.nav.map((n) => (
                <li key={n.href}>
                  <a href={n.href} className="group inline-flex min-h-[2.25rem] items-center text-warm/85 transition-colors hover:text-lime">
                    <RollText>{n.label}</RollText>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* connect */}
          <div className="md:col-span-3">
            <p className="label mb-5 text-muted">Connect</p>
            <ul className="flex flex-col gap-1">
              {site.email && (
                <li>
                  <a href={`mailto:${site.email}`} className="text-warm/85 transition-colors hover:text-lime">
                    {site.email}
                  </a>
                </li>
              )}
              {site.socials.map((s) => (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="noreferrer" className="group inline-flex min-h-[2.25rem] items-center gap-1.5 text-warm/85 transition-colors hover:text-lime">
                    <RollText>{s.label}</RollText>
                    <ArrowUpRight size={14} />
                  </a>
                </li>
              ))}
              <li>
                <a href="#contact" className="group inline-flex min-h-[2.25rem] items-center gap-1.5 text-warm/85 transition-colors hover:text-lime">
                  <RollText>Start a project</RollText>
                  <ArrowUpRight size={14} />
                </a>
              </li>
            </ul>
          </div>

          {/* back to top */}
          <div className="col-span-2 flex md:col-span-1 md:justify-end">
            <button
              type="button"
              onClick={toTop}
              aria-label="Back to top"
              className="group grid h-14 w-14 place-items-center rounded-full border border-white/15 text-warm transition-all duration-500 ease-expo hover:-translate-y-1 hover:border-lime hover:bg-lime hover:text-void"
            >
              <span className="relative block h-[18px] w-[18px] overflow-hidden">
                <ArrowUp size={18} className="absolute inset-0 transition-transform duration-500 ease-expo group-hover:-translate-y-full" />
                <ArrowUp size={18} className="absolute inset-0 translate-y-full transition-transform duration-500 ease-expo group-hover:translate-y-0" />
              </span>
            </button>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-white/[0.08] py-6 text-sm text-muted md:mt-24 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {site.name}. All rights reserved.
          </p>
          <p className="label">Designed &amp; built by DeepVibe</p>
        </div>
      </div>

      {/* oversized wordmark */}
      <div aria-hidden className="pointer-events-none select-none overflow-hidden">
        <div className="container-dv -mb-[2%] mt-10">
          <LogoOutline />
        </div>
      </div>
    </footer>
  );
}
