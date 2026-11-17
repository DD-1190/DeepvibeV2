'use client';

import { useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, MessageCircle } from 'lucide-react';
import { BUDGETS, BUDGET_EXTRA, SERVICES } from '@/lib/chat/flow';
import {
  closeChat,
  confirmHandoff,
  openChat,
  restartChat,
  send,
  setCurrency,
  submitContactDetails,
  submitEnquiry,
  updateData,
  useChat,
} from '@/lib/chat/store';
import type { Currency } from '@/lib/chat/types';
import { whatsappLink } from '@/lib/chat/whatsapp';
import { cn } from '@/lib/cn';
import { ChatHeader } from './ChatHeader';
import { ChatInput } from './ChatInput';
import { ChatMessage } from './ChatMessage';
import { ContactDetailsForm } from './ContactDetailsForm';
import { ProjectSummary } from './ProjectSummary';
import { QuickReplyChips } from './QuickReplyChips';
import { TypingIndicator } from './TypingIndicator';
import { VibeMark } from './VibeMark';

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The project assistant: a glass panel docked bottom-right (full-screen on phones).
 * Any element with `data-open-chat` opens it — the attribute value, if any, pre-answers
 * "what are you looking to build?", and `data-chat-note` adds a note to the enquiry.
 */
export function ContactChatModal() {
  const s = useChat((x) => x);
  const reduce = useReducedMotion();
  const panel = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  /* open from any CTA */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const el = (e.target as Element | null)?.closest<HTMLElement>('[data-open-chat]');
      if (!el) return;
      e.preventDefault();
      opener.current = el;
      void openChat({ answer: el.dataset.openChat || undefined, note: el.dataset.chatNote || undefined });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const close = useCallback(() => {
    closeChat();
    const el = opener.current;
    if (el && document.contains(el) && el.offsetParent !== null) el.focus({ preventScroll: true });
  }, []);

  /* Esc, focus on open, body lock on phones */
  useEffect(() => {
    if (!s.open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('keydown', onKey);
    const phone = window.matchMedia('(max-width: 639px)').matches;
    const prev = document.documentElement.style.overflow;
    if (phone) document.documentElement.style.overflow = 'hidden';
    const t = window.setTimeout(() => (input.current ?? panel.current)?.focus({ preventScroll: true }), 80);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = prev;
      window.clearTimeout(t);
    };
  }, [s.open, close]);

  /* keep the newest message in view */
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    requestAnimationFrame(() => el.scrollTo({ top: el.scrollHeight, behavior: reduce ? 'auto' : 'smooth' }));
  }, [s.messages.length, s.typing, s.step, s.open, s.submit.status, reduce]);

  /* refocus the composer when it's the visitor's turn */
  useEffect(() => {
    if (s.open && !s.typing && window.matchMedia('(pointer: fine)').matches) input.current?.focus({ preventScroll: true });
  }, [s.typing, s.open]);

  const structured = s.step === 'contact' || s.step === 'summary' || s.step === 'done';
  const awaiting = !s.typing;
  const chips = s.chips;

  const placeholder =
    s.step === 'project_type'
      ? 'Or describe it in your own words…'
      : s.step === 'description'
        ? 'A few lines about the business or idea…'
        : s.step === 'budget' || s.step === 'budget_custom'
          ? 'Or type a figure…'
          : 'Type your answer…';

  return (
    <>
      {/* resume pill — only after a conversation has started */}
      <AnimatePresence>
        {!s.open && s.started && s.step !== 'done' && (
          <motion.button
            key="resume"
            type="button"
            onClick={() => void openChat()}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96, transition: { duration: 0.2 } }}
            transition={{ duration: 0.5, ease: EASE }}
            className="chat-resume fixed bottom-5 right-5 z-[80] flex items-center gap-3 rounded-full py-2 pl-2 pr-5 text-left sm:bottom-6 sm:right-6"
            aria-label="Continue your project conversation"
          >
            <VibeMark size={34} />
            <span>
              <span className="block font-display text-[0.875rem] font-medium leading-tight text-warm">Continue the conversation</span>
              <span className="label block text-[0.5625rem] text-muted">Project assistant</span>
            </span>
            <MessageCircle size={15} className="ml-1 text-lime" aria-hidden />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {s.open && (
          <motion.div
            key="chat"
            ref={panel}
            role="dialog"
            aria-modal="false"
            aria-labelledby="chat-title"
            tabIndex={-1}
            data-lenis-prevent
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.94, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.96, filter: 'blur(6px)', transition: { duration: 0.28, ease: EASE } }}
            transition={{ duration: reduce ? 0.15 : 0.6, ease: EASE }}
            style={{ transformOrigin: 'bottom right' }}
            className={cn(
              'chat-panel fixed z-[90] flex flex-col overflow-hidden focus:outline-none',
              'inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[min(720px,calc(100dvh-48px))] sm:w-[min(440px,calc(100vw-48px))] sm:rounded-[30px]',
            )}
          >
            {/* glass light */}
            <span aria-hidden className="chat-sheen" />
            <span aria-hidden className="chat-aurora" />

            <ChatHeader
              online
              onMinimize={closeChat}
              onClose={close}
              onRestart={s.messages.length > 2 && s.submit.status !== 'sending' ? restartChat : undefined}
            />

            <div
              ref={scroller}
              aria-live="polite"
              aria-relevant="additions"
              className="chat-scroll relative flex-1 space-y-3.5 overflow-y-auto overscroll-contain px-4 pb-6 pt-5 sm:px-5"
            >
              {s.messages.map((m, i) => (
                <ChatMessage key={m.id} message={m} showAvatar={m.role === 'assistant' && s.messages[i + 1]?.role !== 'assistant'} />
              ))}

              {s.typing && <TypingIndicator />}

              {awaiting && (
                <div className="space-y-3 pt-1">
                  {s.step === 'services' && (
                    <QuickReplyChips key={`svc-${s.messages.length}`} options={SERVICES} multi onPick={send} label="Services" />
                  )}

                  {s.step === 'budget' && (
                    <div className="space-y-3">
                      <div className="pl-[36px]">
                        <CurrencyToggle value={s.data.currency} onChange={setCurrency} />
                      </div>
                      <QuickReplyChips
                        key={`bud-${s.data.currency}`}
                        options={[...BUDGETS[s.data.currency], ...BUDGET_EXTRA]}
                        onPick={send}
                        label="Budget range"
                      />
                      <button type="button" onClick={() => void send('Skip for now')} className="label ml-[36px] px-1 text-[0.625rem] text-muted transition-colors hover:text-lime">
                        Skip this question →
                      </button>
                    </div>
                  )}

                  {s.step !== 'services' && s.step !== 'budget' && !structured && chips.length > 0 && (
                    <QuickReplyChips key={`c-${s.messages.length}`} options={chips} onPick={send} />
                  )}

                  {s.step === 'contact' && (
                    <ContactDetailsForm
                      initial={{ name: s.data.name, phone: s.data.phone, email: s.data.email, additional_notes: s.data.additional_notes }}
                      onSubmit={(d) => void submitContactDetails(d)}
                    />
                  )}

                  {s.step === 'done' && s.submit.status === 'handoff' && (
                    <div className="ml-[36px] flex flex-wrap gap-2">
                      <a href={whatsappLink(s.data)} target="_blank" rel="noopener noreferrer" className="chat-chip">
                        Open WhatsApp again ↗
                      </a>
                      <button type="button" onClick={close} className="chat-chip">
                        Back to site
                      </button>
                    </div>
                  )}

                  {s.step === 'done' && s.submit.status === 'sent' && (
                    <div className="chat-card ml-[36px] flex items-center gap-3 rounded-[20px] p-4" role="status">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-lime text-void">
                        <Check size={17} strokeWidth={2.5} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-display text-[0.9375rem] font-medium text-warm">Sent to Naman</p>
                        {s.submit.reference && <p className="label mt-0.5 text-[0.5625rem] text-muted">Reference {s.submit.reference}</p>}
                      </div>
                      <button type="button" onClick={close} className="chat-chip !py-2 !text-[0.75rem]">
                        Back to site
                      </button>
                    </div>
                  )}

                  {s.step === 'summary' && (
                    <ProjectSummary data={s.data} submit={s.submit} onChange={updateData} onSubmit={(hp) => void submitEnquiry(hp)} onHandoff={() => void confirmHandoff()} />
                  )}
                </div>
              )}
            </div>

            {/* composer */}
            <div className="relative px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 sm:px-5 sm:pb-5">
              {!structured ? (
                <ChatInput ref={input} onSend={(t) => void send(t)} disabled={s.typing} placeholder={placeholder} />
              ) : (
                <p className="label py-3 text-center text-[0.625rem] text-muted/80">
                  {s.step === 'done' ? 'Thanks for reaching out' : s.step === 'contact' ? 'Almost there' : 'Review, then send'}
                </p>
              )}
              <p className="mt-2.5 text-center text-[0.625rem] leading-snug text-muted/60">
                AI assistant · may make mistakes · conversation stays in this tab
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function CurrencyToggle({ value, onChange }: { value: Currency; onChange: (c: Currency) => void }) {
  return (
    <div role="radiogroup" aria-label="Currency" className="chat-seg relative inline-grid grid-cols-2 rounded-full p-1">
      <span
        aria-hidden
        className={cn('chat-seg-thumb absolute bottom-1 top-1 w-[calc(50%-4px)] rounded-full transition-transform duration-500 ease-expo', value === 'USD' ? 'translate-x-full' : 'translate-x-0')}
        style={{ left: 4 }}
      />
      {(['INR', 'USD'] as Currency[]).map((c) => (
        <button
          key={c}
          type="button"
          role="radio"
          aria-checked={value === c}
          onClick={() => onChange(c)}
          className={cn('label relative z-[1] min-w-[64px] rounded-full px-3 py-2 text-[0.625rem] transition-colors', value === c ? 'text-lime' : 'text-muted hover:text-warm')}
        >
          {c === 'INR' ? '₹ INR' : '$ USD'}
        </button>
      ))}
    </div>
  );
}
