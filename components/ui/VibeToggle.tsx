'use client';

import { useEffect, useRef, useState } from 'react';
import { onBands, startVibe, stopVibe } from '@/lib/vibeAudio';
import { cn } from '@/lib/cn';

/**
 * Equaliser button that switches vibe mode on/off.
 * On: plays the house track, the bars follow the real spectrum and `html.vibe-on`
 * lets the rest of the page react to the beat (see globals.css → "Vibe mode").
 */
export function VibeToggle({ className }: { className?: string }) {
  const [on, setOn] = useState(false);
  const bars = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    document.documentElement.classList.toggle('vibe-on', on);
  }, [on]);

  // Start/stop audio directly inside the click (browsers require a user gesture for sound).
  const toggle = () => {
    const next = !on;
    if (next) startVibe();
    else stopVibe();
    setOn(next);
  };

  useEffect(
    () =>
      onBands((b) => {
        bars.current.forEach((el, i) => {
          if (el) el.style.transform = `scaleY(${b[i] ?? 0.15})`;
        });
      }),
    [],
  );

  useEffect(() => () => stopVibe(), []);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? 'Turn vibe mode off (stops music)' : 'Turn vibe mode on (plays ambient music)'}
      title={on ? 'Stop the vibe' : 'Play the vibe'}
      className={cn(
        'group/vibe relative grid h-9 w-11 place-items-center rounded-full border transition-[border-color,background-color,box-shadow] duration-500',
        on
          ? 'border-lime/70 bg-lime/10 shadow-[0_0_24px_-4px_rgba(185,245,107,0.55)]'
          : 'border-white/10 hover:border-lime/50 hover:bg-lime/[0.06]',
        className,
      )}
    >
      <span className={cn('eq flex h-4 items-end gap-[2.5px]', on && 'eq-on')}>
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            ref={(el) => {
              bars.current[i] = el;
            }}
            className="eq-bar block w-[2.5px] origin-bottom rounded-full bg-lime transition-transform duration-150"
            style={{ animationDelay: `${i * -0.31}s` }}
          />
        ))}
      </span>
      {!on && (
        <span
          aria-hidden
          style={{ animationIterationCount: 4, animationDelay: '2.5s' }}
          className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-ping rounded-full bg-lime/70 opacity-0 motion-reduce:hidden"
        />
      )}
    </button>
  );
}
