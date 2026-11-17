'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/cn';

type Props = {
  options: string[];
  onPick: (value: string) => void;
  multi?: boolean;
  disabled?: boolean;
  label?: string;
};

/** Tappable answers. Single-select sends immediately; multi-select adds a Continue button. */
export function QuickReplyChips({ options, onPick, multi, disabled, label = 'Suggested replies' }: Props) {
  const reduce = useReducedMotion();
  const [picked, setPicked] = useState<string[]>([]);
  if (!options.length) return null;
  const toggle = (o: string) => setPicked((p) => (p.includes(o) ? p.filter((x) => x !== o) : [...p, o]));

  return (
    <div className="pl-[36px]">
      <div role="group" aria-label={label} className="flex flex-wrap gap-2">
        {options.map((o, i) => {
          const on = picked.includes(o);
          return (
            <motion.button
              key={o}
              type="button"
              disabled={disabled}
              aria-pressed={multi ? on : undefined}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: reduce ? 0 : 0.05 * i, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => (multi ? toggle(o) : onPick(o))}
              className={cn('chat-chip', on && 'chat-chip-on')}
            >
              {multi && (
                <span className={cn('grid h-4 w-4 place-items-center rounded-full border transition-colors', on ? 'border-lime bg-lime text-void' : 'border-white/25')}>
                  {on && <Check size={10} strokeWidth={3} />}
                </span>
              )}
              {o}
            </motion.button>
          );
        })}
      </div>
      {multi && (
        <button
          type="button"
          disabled={disabled || !picked.length}
          onClick={() => onPick(picked.join(', '))}
          className="chat-primary mt-3 h-10 px-4 text-[0.75rem] disabled:opacity-40"
        >
          Continue{picked.length ? ` · ${picked.length}` : ''} <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
}
