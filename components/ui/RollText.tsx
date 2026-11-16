import { cn } from '@/lib/cn';

/**
 * Text that rolls up to a duplicate of itself on hover.
 * Parent must carry the `group` class.
 */
export function RollText({ children, className }: { children: string; className?: string }) {
  return (
    <span className={cn('relative inline-flex overflow-hidden leading-[1.15]', className)}>
      <span className="block transition-transform duration-500 ease-expo group-hover:-translate-y-full motion-reduce:transition-none">
        {children}
      </span>
      <span
        aria-hidden
        className="absolute inset-0 block translate-y-full transition-transform duration-500 ease-expo group-hover:translate-y-0 motion-reduce:transition-none"
      >
        {children}
      </span>
    </span>
  );
}
