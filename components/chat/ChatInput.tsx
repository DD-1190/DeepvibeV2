'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ArrowUp } from 'lucide-react';

type Props = { onSend: (text: string) => void; disabled?: boolean; placeholder?: string };

/** Glass composer. Enter sends, Shift+Enter adds a new line. Grows up to ~5 lines. */
export const ChatInput = forwardRef<HTMLTextAreaElement, Props>(function ChatInput({ onSend, disabled, placeholder }, outer) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useImperativeHandle(outer, () => ref.current!);
  const [value, setValue] = useState('');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = '0px';
    el.style.height = Math.min(el.scrollHeight, 132) + 'px';
  }, [value]);

  const submit = () => {
    const v = value.trim();
    if (!v || disabled) return;
    onSend(v);
    setValue('');
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="chat-composer flex items-end gap-2 rounded-[22px] p-1.5 pl-4"
    >
      <label htmlFor="chat-input" className="sr-only">
        Your message
      </label>
      <textarea
        id="chat-input"
        ref={ref}
        rows={1}
        value={value}
        maxLength={2000}
        placeholder={placeholder ?? 'Type your message…'}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            submit();
          }
        }}
        className="max-h-[132px] min-h-[24px] flex-1 resize-none self-center bg-transparent py-2 text-[0.9375rem] leading-6 text-warm placeholder:text-muted/70 focus:outline-none"
      />
      <button
        type="submit"
        aria-label="Send message"
        disabled={disabled || !value.trim()}
        className="chat-send grid h-10 w-10 shrink-0 place-items-center rounded-full"
      >
        <ArrowUp size={18} strokeWidth={2.25} />
      </button>
    </form>
  );
});
