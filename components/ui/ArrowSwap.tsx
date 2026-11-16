import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/cn';

/** ↗ arrow that exits top-right and re-enters from bottom-left on hover (parent needs `group`). */
export function ArrowSwap({ className, size = 16 }: { className?: string; size?: number }) {
  const base = 'absolute inset-0 transition-transform duration-500 ease-expo motion-reduce:transition-none';
  return (
    <span aria-hidden className={cn('relative inline-block overflow-hidden', className)} style={{ width: size, height: size }}>
      <ArrowUpRight
        size={size}
        strokeWidth={2}
        className={cn(base, 'group-hover:translate-x-full group-hover:-translate-y-full')}
      />
      <ArrowUpRight
        size={size}
        strokeWidth={2}
        className={cn(base, '-translate-x-full translate-y-full group-hover:translate-x-0 group-hover:translate-y-0')}
      />
    </span>
  );
}
