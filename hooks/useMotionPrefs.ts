'use client';

import { useEffect, useState } from 'react';

/** Reduced-motion + fine-pointer detection, kept in sync with the OS setting. */
export function useMotionPrefs() {
  const [prefs, setPrefs] = useState({ reduced: false, finePointer: false });

  useEffect(() => {
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)');
    const fp = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setPrefs({ reduced: rm.matches, finePointer: fp.matches });
    update();
    rm.addEventListener('change', update);
    fp.addEventListener('change', update);
    return () => {
      rm.removeEventListener('change', update);
      fp.removeEventListener('change', update);
    };
  }, []);

  return prefs;
}

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
