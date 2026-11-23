'use client';

import { useRef, useState } from 'react';
import { Play } from 'lucide-react';

type Props = { src: string; poster: string; title: string; width: number; height: number };

/** Article film: poster + one minimal play control; native controls appear once it's playing. Never autoplays. */
export function ArticleVideo({ src, poster, title, width, height }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  const play = () => {
    const v = ref.current;
    if (!v) return;
    setStarted(true);
    v.play().catch(() => undefined);
  };

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-surface" style={{ aspectRatio: `${width} / ${height}` }}>
      <video
        ref={ref}
        src={src}
        poster={poster}
        preload="none"
        playsInline
        controls={started}
        aria-label={title}
        onEnded={() => setStarted(false)}
        className="absolute inset-0 h-full w-full object-cover"
      />
      {!started && (
        <button
          type="button"
          onClick={play}
          aria-label={`Play film: ${title}`}
          data-cursor="play"
          className="group absolute inset-0 grid place-items-center bg-void/10 transition-colors duration-500 hover:bg-void/0"
        >
          <span className="founder-play flex items-center gap-3 rounded-full py-2 pl-2 pr-5 text-warm" style={{ position: 'static', transform: 'none' }}>
            <span className="grid h-12 w-12 place-items-center rounded-full bg-lime text-void transition-transform duration-500 ease-expo group-hover:scale-105">
              <Play size={16} fill="currentColor" className="translate-x-[1px]" />
            </span>
            <span className="label text-[0.6875rem] text-warm/90">Watch the film · 0:48</span>
          </span>
        </button>
      )}
    </div>
  );
}
