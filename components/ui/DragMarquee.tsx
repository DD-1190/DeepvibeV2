'use client';

import { ReactNode, useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Endless marquee that drifts on its own and can be grabbed and flung (mouse, pen or touch).
 * Shows the "DRAG" cursor via data-cursor. Vertical page scrolling on touch still works (touch-action: pan-y).
 * Reduced motion: no auto-drift, dragging still works.
 */
export function DragMarquee({ children, speed = 45, className }: { children: ReactNode; speed?: number; className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (!wrap || !track) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const drift = reduced ? 0 : speed;

    let x = 0;
    let half = track.scrollWidth / 2;
    let dragging = false;
    let lastX = 0;
    let momentum = 0;
    let hover = false;
    let pointerId: number | null = null;

    const measure = () => {
      half = track.scrollWidth / 2;
    };
    const ro = new ResizeObserver(measure);
    ro.observe(track);

    const tick = (_t: number, dt: number) => {
      if (!dragging) {
        const auto = hover ? drift * 0.25 : drift;
        x -= (auto * dt) / 1000;
        x += momentum;
        momentum *= 0.94;
        if (Math.abs(momentum) < 0.01) momentum = 0;
      }
      if (half > 0) x = gsap.utils.wrap(-half, 0, x);
      gsap.set(track, { x });
    };
    gsap.ticker.add(tick);

    const down = (e: PointerEvent) => {
      dragging = true;
      pointerId = e.pointerId;
      lastX = e.clientX;
      momentum = 0;
      wrap.setPointerCapture(e.pointerId);
      wrap.dataset.dragging = 'true';
    };
    const move = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== pointerId) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      x += dx;
      momentum = dx;
    };
    const up = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      dragging = false;
      pointerId = null;
      momentum = Math.max(-40, Math.min(40, momentum));
      wrap.dataset.dragging = 'false';
    };
    const enter = () => (hover = true);
    const leave = () => (hover = false);

    wrap.addEventListener('pointerdown', down);
    wrap.addEventListener('pointermove', move);
    wrap.addEventListener('pointerup', up);
    wrap.addEventListener('pointercancel', up);
    wrap.addEventListener('pointerenter', enter);
    wrap.addEventListener('pointerleave', leave);

    return () => {
      gsap.ticker.remove(tick);
      ro.disconnect();
      wrap.removeEventListener('pointerdown', down);
      wrap.removeEventListener('pointermove', move);
      wrap.removeEventListener('pointerup', up);
      wrap.removeEventListener('pointercancel', up);
      wrap.removeEventListener('pointerenter', enter);
      wrap.removeEventListener('pointerleave', leave);
    };
  }, [speed]);

  return (
    <div
      ref={wrapRef}
      data-cursor="drag"
      data-dragging="false"
      className={`relative select-none overflow-hidden [touch-action:pan-y] ${className ?? ''}`}
    >
      <div ref={trackRef} className="flex w-max will-change-transform">
        {children}
        <div aria-hidden className="flex shrink-0">
          {children}
        </div>
      </div>
    </div>
  );
}
