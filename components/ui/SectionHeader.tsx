import { cn } from '@/lib/cn';

type Props = {
  index: string;
  label: string;
  headline: string;
  highlight?: string[];
  id: string;
  className?: string;
  headlineClassName?: string;
};

/**
 * Numbered label row + oversized split headline.
 * Animated by `useSectionReveal` via the data-sh-* hooks.
 */
export function SectionHeader({ index, label, headline, highlight = [], id, className, headlineClassName }: Props) {
  const words = headline.split(' ');
  return (
    <div className={className}>
      <div data-sh-label className="sh-pre mb-10 flex items-center gap-5 md:mb-16">
        <span className="label text-lime">{index}</span>
        <span data-sh-rule className="h-px flex-1 origin-left bg-gradient-to-r from-white/20 via-white/10 to-transparent" />
        <span className="label text-muted">{label}</span>
      </div>
      <h2
        id={id}
        data-sh-title
        className={cn(
          'font-display text-[clamp(2.75rem,1rem+6vw,7.5rem)] font-medium leading-[0.95] tracking-[-0.05em] text-warm',
          headlineClassName,
        )}
      >
        {words.map((w, i) => (
          <span key={i} className="-mb-[0.1em] inline-block overflow-hidden pb-[0.1em] align-top">
            <span data-sh-word className={cn('inline-block origin-bottom-left', highlight.includes(w) && 'text-lime')}>
              {w}
            </span>
            {i < words.length - 1 && ' '}
          </span>
        ))}
      </h2>
    </div>
  );
}
