'use client';

import { useRef } from 'react';
import { useMagnetic } from '@/hooks/useMagnetic';
import { cn } from '@/lib/cn';
import { ArrowSwap } from './ArrowSwap';
import { RollText } from './RollText';

type Props = {
  href: string;
  children: string;
  size?: 'sm' | 'lg';
  className?: string;
  onClick?: () => void;
  /** Opens the project assistant instead of following the link (link stays as a no-JS fallback). */
  openChat?: boolean | string;
};

/** Primary acid-lime pill CTA with magnetic pull, rolling label and swapping arrow. */
export function MagneticButton({ href, children, size = 'lg', className, onClick, openChat }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  useMagnetic(ref, size === 'lg' ? 0.28 : 0.2);

  return (
    <a
      ref={ref}
      href={href}
      onClick={onClick}
      data-open-chat={openChat ? (typeof openChat === 'string' ? openChat : '') : undefined}
      className={cn(
        'group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full bg-lime font-display font-medium uppercase text-void',
        'shadow-[0_0_0_0_rgba(185,245,107,0)] transition-shadow duration-500 hover:shadow-[0_10px_40px_-8px_rgba(185,245,107,0.45)]',
        size === 'lg' ? 'h-14 pl-7 pr-2 text-[0.8125rem] tracking-[0.08em]' : 'h-10 pl-5 pr-1.5 text-xs tracking-[0.06em]',
        className,
      )}
    >
      {/* sheen sweep */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-expo group-hover:translate-x-full motion-reduce:hidden"
      />
      <RollText>{children}</RollText>
      <span
        className={cn(
          'relative grid place-items-center rounded-full bg-void text-lime transition-transform duration-500 ease-expo group-hover:rotate-0',
          size === 'lg' ? 'h-10 w-10' : 'h-7 w-7',
        )}
      >
        <ArrowSwap size={size === 'lg' ? 16 : 13} />
      </span>
    </a>
  );
}
