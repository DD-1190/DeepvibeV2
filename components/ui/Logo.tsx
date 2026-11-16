import { cn } from '@/lib/cn';
import { LOGO_DEEP, LOGO_VIBE, LOGO_VIEWBOX } from './logoPaths';

/**
 * DeepVibe wordmark (vector). "Deep" stays warm white; the hand-lettered "vibe"
 * is acid lime and gently nods to a beat (faster on hover / in vibe mode).
 */
export function Logo({ className, onClick, height = 22 }: { className?: string; onClick?: () => void; height?: number }) {
  return (
    <a href="#top" onClick={onClick} aria-label="DeepVibe — back to top" className={cn('logo group inline-flex items-center', className)}>
      <svg viewBox={LOGO_VIEWBOX} style={{ height }} className="w-auto overflow-visible" aria-hidden>
        <path className="logo-deep" fill="#E9EDE5" fillRule="evenodd" d={LOGO_DEEP} />
        <g className="logo-vibe">
          <path fill="#B9F56B" fillRule="evenodd" d={LOGO_VIBE} />
        </g>
      </svg>
    </a>
  );
}

/** Outline-only version for the oversized footer wordmark. */
export function LogoOutline({ className }: { className?: string }) {
  return (
    <svg viewBox={LOGO_VIEWBOX} className={cn('h-auto w-full overflow-visible', className)} aria-hidden>
      <path fill="none" stroke="rgba(233,237,229,0.14)" strokeWidth="2" vectorEffect="non-scaling-stroke" fillRule="evenodd" d={LOGO_DEEP} />
      <path fill="none" stroke="rgba(185,245,107,0.45)" strokeWidth="2" vectorEffect="non-scaling-stroke" fillRule="evenodd" d={LOGO_VIBE} />
    </svg>
  );
}
