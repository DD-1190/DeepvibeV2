'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { contact } from '@/data/site';
import { useSectionReveal } from '@/hooks/useSectionReveal';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { ArrowUp } from 'lucide-react';
import { VibeMark } from '@/components/chat/VibeMark';
import { PROJECT_TYPES } from '@/lib/chat/flow';

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
              <MagneticButton href="#contact" openChat>
                {contact.cta}
              </MagneticButton>
            </div>
          </div>

          {/* conversation starter — every answer opens the project assistant, pre-answered */}
          <div data-reveal className="chat-panel relative overflow-hidden rounded-[30px] p-5 sm:p-7 md:p-9 lg:col-span-7 lg:col-start-6">
            <span aria-hidden className="chat-sheen" />
            <span aria-hidden className="chat-aurora" />
            <div className="relative flex items-center gap-3.5">
              <VibeMark size={42} />
              <div className="min-w-0 flex-1">
                <p className="font-display text-[1.375rem] font-medium leading-none tracking-[-0.03em] text-warm">
                  Let&apos;s talk<span className="text-lime">.</span>
                </p>
                <p className="mt-1.5 text-[0.8125rem] text-muted">Your AI-powered project assistant.</p>
              </div>
              <span className="label hidden items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-[0.625rem] text-warm/80 sm:inline-flex">
                <span className="chat-live" aria-hidden /> Online
              </span>
            </div>

            <div className="relative mt-8 flex items-end gap-2.5">
              <VibeMark size={26} />
              <p className="chat-bubble-ai max-w-[34rem] rounded-[20px] rounded-bl-md px-4 py-3 text-[0.9375rem] leading-[1.55] text-warm/95 md:text-base">
                Hey, welcome to DeepVibe. Tell me what you&apos;re building and Naman will reach out to you personally on WhatsApp — it takes 20 seconds.
                <br />
                <span className="mt-2 block text-warm">What are you looking to build?</span>
              </p>
            </div>

            <div className="relative mt-4 flex flex-wrap gap-2 pl-[36px]" role="group" aria-label="Start with a project type">
              {PROJECT_TYPES.map((t) => (
                <button key={t} type="button" data-open-chat={t} className="chat-chip">
                  {t}
                </button>
              ))}
            </div>

            <button
              type="button"
              data-open-chat=""
              className="chat-composer relative mt-8 flex w-full items-center gap-2 rounded-[22px] p-1.5 pl-4 text-left md:mt-10"
              aria-label="Describe your project to the assistant"
            >
              <span className="flex-1 py-2 text-[0.9375rem] text-muted/80">Or describe it in your own words…</span>
              <span className="chat-send grid h-10 w-10 shrink-0 place-items-center rounded-full">
                <ArrowUp size={18} strokeWidth={2.25} />
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
