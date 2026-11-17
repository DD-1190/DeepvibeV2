'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ChatMessage as Msg } from '@/lib/chat/types';
import { cn } from '@/lib/cn';
import { VibeMark } from './VibeMark';

export function ChatMessage({ message, showAvatar }: { message: Msg; showAvatar: boolean }) {
  const reduce = useReducedMotion();
  const ai = message.role === 'assistant';
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: reduce ? 0.15 : 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={cn('flex items-end gap-2.5', ai ? 'justify-start' : 'justify-end')}
    >
      {ai && (showAvatar ? <VibeMark size={26} /> : <span className="w-[26px] shrink-0" aria-hidden />)}
      <p
        className={cn(
          'max-w-[85%] whitespace-pre-line break-words px-4 py-3 text-[0.9375rem] leading-[1.55]',
          ai ? 'chat-bubble-ai rounded-[20px] rounded-bl-md text-warm/95' : 'chat-bubble-user rounded-[20px] rounded-br-md text-warm',
        )}
      >
        <span className="sr-only">{ai ? 'DeepVibe assistant: ' : 'You: '}</span>
        {message.text}
      </p>
    </motion.div>
  );
}
