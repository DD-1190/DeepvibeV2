import { cn } from '@/lib/cn';

/** The DeepVibe D-chevron mark (Bone + Signal Lime) in a small glass orb — the assistant's avatar. */
export function VibeMark({ className, size = 36 }: { className?: string; size?: number }) {
  return (
    <span
      aria-hidden
      style={{ width: size, height: size }}
      className={cn('chat-orb relative grid shrink-0 place-items-center rounded-full', className)}
    >
      <svg viewBox="0 0 512 512" style={{ width: size * 0.44 }} className="relative h-auto translate-x-[4%]">
        <path fill="#B9F56B" d="M176 329 L368 329 C386 355 388 400 373 432 L335 475 Q302 512 252 512 L0 512 Z" />
        <path fill="#F3F4EF" d="M0 0 L290 0 Q344 0 382 38 L477 133 Q509 165 509 210 L509 235 Q509 280 479 314 L373 432 C388 400 386 355 368 329 C360 300 345 276 313 250 Z" />
      </svg>
    </span>
  );
}
