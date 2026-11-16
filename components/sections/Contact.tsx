'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { contact } from '@/data/site';
import { useSectionReveal } from '@/hooks/useSectionReveal';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { EnquiryForm } from '@/components/contact/EnquiryForm';

export function Contact() {
  const root = useRef<HTMLElement>(null);

  useSectionReveal(root, () => {
    gsap.fromTo(
      '[data-cta-glow]',
      { scale: 0.6, opacity: 0 },
      { scale: 1, opacity: 1, duration: 2, ease: 'expo.out', scrollTrigger: { trigger: '[data-cta-glow]', start: 'top 90%' } },
    );
  });

  return (
    <section ref={root} id="contact" aria-labelledby="contact-title" className="relative isolate scroll-mt-20 overflow-hidden py-24 md:py-28 lg:py-36">
      {/* acid-lime light + grid */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div data-vibe-glow className="absolute left-1/2 top-[-5%] h-[60vmax] w-[60vmax] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(185,245,107,0.2),transparent_60%)] opacity-0" />
        <div data-cta-glow className="absolute left-1/2 top-[-10%] h-[70vmax] w-[70vmax] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(185,245,107,0.14)_0%,rgba(185,245,107,0.04)_35%,transparent_65%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(233,237,229,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(233,237,229,0.03)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,#000,transparent)]" />
      </div>

      <div className="container-dv">
        <SectionHeader
          id="contact-title"
          index={contact.index}
          label={contact.label}
          headline={contact.headline}
          highlight={contact.highlight}
          headlineClassName="max-w-[13ch]"
        />

        <div className="mt-12 grid grid-cols-1 gap-16 md:mt-16 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <p data-reveal className="max-w-[26ch] font-display text-[1.5rem] leading-[1.25] tracking-[-0.02em] text-muted md:text-[1.875rem]">
              {contact.sub}
            </p>
            <div data-reveal className="mt-10">
              <MagneticButton
                href="#enquiry"
                onClick={() => {
                  // focus the first field after the smooth scroll
                  window.setTimeout(() => document.querySelector<HTMLInputElement>('#enquiry input[name="name"]')?.focus({ preventScroll: true }), 650);
                }}
              >
                {contact.cta}
              </MagneticButton>
            </div>
          </div>

          <div id="enquiry" data-reveal className="glass scroll-mt-28 rounded-[28px] border border-white/[0.08] p-6 sm:p-8 md:p-12 lg:col-span-7 lg:col-start-6">
            <EnquiryForm />
          </div>
        </div>
      </div>
    </section>
  );
}
