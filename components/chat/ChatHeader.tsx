'use client';

import { Minus, RotateCcw, X } from 'lucide-react';
import { VibeMark } from './VibeMark';

type Props = { onMinimize: () => void; onClose: () => void; onRestart?: () => void; online: boolean };

export function ChatHeader({ onMinimize, onClose, onRestart, online }: Props) {
  return (
    <header className="relative flex items-center gap-3.5 px-5 pb-4 pt-5 sm:px-6">
      <VibeMark size={42} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2.5">
          <h2 id="chat-title" className="font-display text-[1.375rem] font-medium leading-none tracking-[-0.03em] text-warm">
            Let&apos;s talk<span className="text-lime">.</span>
          </h2>
          <span className="label inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-[0.5625rem] text-warm/80">
            <span className={online ? 'chat-live' : 'h-1.5 w-1.5 rounded-full bg-muted'} aria-hidden />
            {online ? 'Online' : 'Offline'}
          </span>
        </div>
        <p className="mt-1.5 text-[0.78rem] leading-snug text-muted">Your AI-powered project assistant.</p>
      </div>
      <div className="-mr-1.5 flex items-center">
        {onRestart && (
          <button type="button" onClick={onRestart} aria-label="Start over" title="Start over" className="chat-icon-btn">
            <RotateCcw size={15} />
          </button>
        )}
        <button type="button" onClick={onMinimize} aria-label="Minimise chat" title="Minimise" className="chat-icon-btn max-sm:hidden">
          <Minus size={16} />
        </button>
        <button type="button" onClick={onClose} aria-label="Close chat" title="Close (Esc)" className="chat-icon-btn">
          <X size={17} />
        </button>
      </div>
      <span aria-hidden className="pointer-events-none absolute inset-x-5 bottom-0 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent sm:inset-x-6" />
    </header>
  );
}
