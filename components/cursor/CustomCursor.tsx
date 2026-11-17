'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

/**
 * DeepVibe custom cursor.
 *
 * - Desktop + fine pointer only; renders nothing on touch devices.
 * - Zero React re-renders while moving: position is driven by GSAP quickTo/quickSetter,
 *   and the visual state is a data attribute on the root (CSS does the morphing).
 * - Dot follows the pointer instantly; the ring trails with a soft spring.
 * - Never intercepts events (pointer-events: none).
 * - Native cursor is kept for text fields and while the user is selecting text.
 *
 * States (set via data-cursor on any element, or inferred):
 *   default · hover (links/buttons) · view · play · pause · drag · text (native) · hidden
 * Optional: data-cursor-label="…" overrides the label for view/drag.
 */

type CursorState = 'default' | 'hover' | 'view' | 'play' | 'pause' | 'drag' | 'text';

const EXPLICIT = '[data-cursor]';
const INTERACTIVE = 'a[href], button, [role="button"], label, summary, [tabindex]:not([tabindex="-1"])';
const EDITABLE =
  'input:not([type="radio"]):not([type="checkbox"]):not([type="submit"]):not([type="button"]):not([type="range"]), textarea, select, [contenteditable=""], [contenteditable="true"]';

function resolve(target: EventTarget | null): { state: CursorState; label: string | null } {
  if (!(target instanceof Element)) return { state: 'default', label: null };
  if (target.closest(EDITABLE)) return { state: 'text', label: null };
  const explicit = target.closest<HTMLElement>(EXPLICIT);
  const interactive = target.closest(INTERACTIVE);
  // a button/link nested inside a data-cursor area (e.g. the video's play button) still gets the hover ring
  if (interactive && explicit && interactive !== explicit && explicit.contains(interactive)) {
    return { state: 'hover', label: null };
  }
  if (explicit) {
    const v = explicit.dataset.cursor as CursorState | 'none' | undefined;
    if (v === 'none') return { state: 'default', label: null };
    if (v && ['hover', 'view', 'play', 'pause', 'drag', 'text'].includes(v)) {
      return { state: v as CursorState, label: explicit.dataset.cursorLabel ?? null };
    }
  }
  if (interactive) return { state: 'hover', label: null };
  return { state: 'default', label: null };
}

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  // Only on devices with a precise, hover-capable pointer.
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const root = rootRef.current;
    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!root || !dot || !ring || !label) return;

    const html = document.documentElement;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    html.classList.add('has-custom-cursor');
    if (reduced) root.dataset.reduced = 'true';

    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, x: -100, y: -100 });
    const dotX = gsap.quickSetter(dot, 'x', 'px');
    const dotY = gsap.quickSetter(dot, 'y', 'px');
    const ringX = reduced ? gsap.quickSetter(ring, 'x', 'px') : gsap.quickTo(ring, 'x', { duration: 0.42, ease: 'power3.out' });
    const ringY = reduced ? gsap.quickSetter(ring, 'y', 'px') : gsap.quickTo(ring, 'y', { duration: 0.42, ease: 'power3.out' });

    let state: CursorState = 'default';
    let lastTarget: EventTarget | null = null;
    let selecting = false;
    let visible = false;

    const applyState = (next: CursorState, text: string | null) => {
      const lbl = next === 'view' ? text ?? 'View ↗' : next === 'drag' ? text ?? 'Drag' : '';
      if (label.textContent !== lbl) label.textContent = lbl;
      if (next === state) return;
      state = next;
      root.dataset.state = next;
      html.classList.toggle('cursor-native', next === 'text');
    };

    const show = (on: boolean) => {
      if (on === visible) return;
      visible = on;
      root.dataset.visible = on ? 'true' : 'false';
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      if (!visible) {
        // first move / re-entry: jump the ring so it doesn't sweep across the screen
        gsap.set(ring, { x: e.clientX, y: e.clientY });
        show(true);
      }
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
      if (e.target !== lastTarget && !selecting) {
        lastTarget = e.target;
        const r = resolve(e.target);
        applyState(r.state, r.label);
      }
    };

    // Re-resolve when the DOM under a still pointer changes (e.g. after scrolling).
    const onScroll = () => {
      if (!visible || selecting) return;
      const x = gsap.getProperty(dot, 'x') as number;
      const y = gsap.getProperty(dot, 'y') as number;
      const el = document.elementFromPoint(x, y);
      if (el !== lastTarget) {
        lastTarget = el;
        const r = resolve(el);
        applyState(r.state, r.label);
      }
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      root.dataset.pressed = 'true';
      const t = e.target as Element | null;
      if (t && !t.closest(`${INTERACTIVE}, ${EXPLICIT}, ${EDITABLE}`)) selecting = true;
    };
    const onUp = () => {
      root.dataset.pressed = 'false';
      if (selecting) {
        selecting = false;
        const r = resolve(lastTarget);
        applyState(r.state, r.label);
      }
    };
    // While the user drags to select text, hand back the native I-beam.
    const onSelection = () => {
      if (!selecting) return;
      const sel = document.getSelection();
      if (sel && !sel.isCollapsed) applyState('text', null);
    };

    const onLeave = (e: MouseEvent) => {
      if (!e.relatedTarget) show(false);
    };
    const onBlur = () => show(false);

    // Re-resolve when a data-cursor value changes under a still pointer (e.g. play → pause after a click).
    const mo = new MutationObserver(() => {
      if (!visible || selecting || !lastTarget) return;
      const r = resolve(lastTarget);
      applyState(r.state, r.label);
    });
    mo.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['data-cursor', 'data-cursor-label'] });

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('blur', onBlur);
    document.addEventListener('mouseout', onLeave);
    document.addEventListener('selectionchange', onSelection);

    return () => {
      mo.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('mouseout', onLeave);
      document.removeEventListener('selectionchange', onSelection);
      html.classList.remove('has-custom-cursor', 'cursor-native');
      gsap.killTweensOf([dot, ring]);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div ref={rootRef} className="dv-cursor" data-state="default" data-visible="false" data-pressed="false" aria-hidden>
      {/* outer elements are positioned by GSAP; inner shapes are styled/scaled by CSS */}
      <div ref={ringRef} className="dv-cursor__ring">
        <div className="dv-cursor__ring-shape">
          <span className="dv-cursor__fill" />
          <span ref={labelRef} className="dv-cursor__label" />
          <svg className="dv-cursor__icon dv-cursor__icon--play" viewBox="0 0 24 24" width="20" height="20">
            <path d="M8 5.5v13l10.5-6.5L8 5.5z" fill="currentColor" />
          </svg>
          <svg className="dv-cursor__icon dv-cursor__icon--pause" viewBox="0 0 24 24" width="20" height="20">
            <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor" />
          </svg>
        </div>
      </div>
      <div ref={dotRef} className="dv-cursor__dot">
        <div className="dv-cursor__dot-shape" />
      </div>
    </div>
  );
}
