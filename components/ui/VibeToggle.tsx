'use client';

import { useEffect, useRef, useState } from 'react';
import { onBands, startVibe, stopVibe } from '@/lib/vibeAudio';
import { cn } from '@/lib/cn';

/**
 * Vibe-mode music toggle — a single glass capsule (one control, two visual states).
 *   Playing → the inset selection sits on the left over live acid-lime equaliser bars, with a soft glow.
 *   Paused  → the selection slides right onto a play icon; no glow.
 * Clicking anywhere on the capsule toggles. Styles live in globals.css → "Vibe capsule".
 */
const IDLE = [0.32, 0.48, 0.64, 0.8, 0.96]; // resting "signal" silhouette

export function VibeToggle({ className }: { className?: string }) {
  const [on, setOn] = useState(false);
  const bars = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    document.documentElement.classList.toggle('vibe-on', on);
  }, [on]);

  // Live spectrum → bars. Each bar shows its band's swing around its own running average
  // (steady sound sits mid-height; changes push it up or down), so even calm ambient music dances.
  useEffect(() => {
    const mean = [0, 0, 0, 0, 0];
    const dev = [0.02, 0.02, 0.02, 0.02, 0.02];
    return onBands((b) => {
      bars.current.forEach((el, i) => {
        if (!el) return;
        const v = b[i] ?? 0;
        mean[i] = mean[i] ? mean[i] * 0.96 + v * 0.04 : v;
        dev[i] = Math.max(0.004, dev[i] * 0.97 + Math.abs(v - mean[i]) * 0.03);
        const z = (v - mean[i]) / (dev[i] * 1.6); // ~ -1..1
        const norm = Math.min(1, Math.max(0, 0.5 + z * 0.5));
        el.style.transform = `scaleY(${(0.2 + 0.8 * norm).toFixed(3)})`;
      });
    });
  }, []);

  // reset bars to the resting silhouette when paused
  useEffect(() => {
    if (on) return;
    bars.current.forEach((el, i) => {
      if (el) el.style.transform = `scaleY(${IDLE[i]})`;
    });
  }, [on]);

  useEffect(() => () => stopVibe(), []);

  // Start/stop audio directly inside the click (browsers require a user gesture for sound).
  const toggle = () => {
    const next = !on;
    if (next) startVibe();
    else stopVibe();
    setOn(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? 'Pause ambient music' : 'Play ambient music'}
      title={on ? 'Pause the vibe' : 'Play the vibe'}
      data-on={on ? 'true' : 'false'}
      className={cn('vibe-capsule', className)}
    >
      {/* sliding inset selection */}
      <span aria-hidden className="vibe-capsule__thumb" />

      {/* left: playing — equaliser */}
      <span aria-hidden className="vibe-capsule__seg vibe-capsule__seg--eq">
        <span className="flex h-[13px] items-end gap-[2.5px]">
          {IDLE.map((h, i) => (
            <span
              key={i}
              ref={(el) => {
                bars.current[i] = el;
              }}
              className="vibe-capsule__bar"
              style={{ transform: `scaleY(${h})` }}
            />
          ))}
        </span>
      </span>

      {/* right: paused — play */}
      <span aria-hidden className="vibe-capsule__seg vibe-capsule__seg--play">
        <svg viewBox="0 0 24 24" width="13" height="13">
          <path d="M8 5.2v13.6c0 .8.9 1.3 1.6.9l10.6-6.8c.6-.4.6-1.4 0-1.8L9.6 4.3C8.9 3.9 8 4.4 8 5.2z" fill="currentColor" />
        </svg>
      </span>
    </button>
  );
}
