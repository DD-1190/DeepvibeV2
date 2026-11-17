'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { founderVideo, site } from '@/data/site';
import { cn } from '@/lib/cn';
import { VideoPlaceholder } from './VideoPlaceholder';
import { FounderPortrait } from './FounderPortrait';

type Sources = { webm: string | null; mp4: string | null };

/**
 * Founder film container.
 * - WebM first, MP4 fallback, optional lighter mobile encode (chosen by viewport, so phones never download the desktop file)
 * - poster, muted autoplay + loop, playsInline
 * - play/pause + sound toggle
 * - pauses when scrolled out of view; no autoplay for reduced-motion users
 * - falls back to the placeholder if no source is configured or the file fails to load
 */
export function FounderVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [ready, setReady] = useState(false);
  const wantsPlay = useRef(true);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) wantsPlay.current = false;
    return () => mq.removeEventListener('change', update);
  }, []);

  const sources: Sources | null = (() => {
    if (isMobile === null) return null;
    const mobile = { webm: founderVideo.mobileWebm, mp4: founderVideo.mobileMp4 };
    const desktop = { webm: founderVideo.webm, mp4: founderVideo.mp4 };
    const pick = isMobile && (mobile.webm || mobile.mp4) ? mobile : desktop;
    return pick.webm || pick.mp4 ? pick : null;
  })();
  const hasVideo = !!sources && !failed;

  // Source error detection (errors fire on <source>, not <video>)
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !hasVideo) return;
    const els = Array.from(v.querySelectorAll('source'));
    const last = els[els.length - 1];
    const onErr = () => setFailed(true);
    last?.addEventListener('error', onErr);
    v.addEventListener('error', onErr);
    return () => {
      last?.removeEventListener('error', onErr);
      v.removeEventListener('error', onErr);
    };
  }, [hasVideo, isMobile]);

  // Only play while on screen
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !hasVideo) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && wantsPlay.current) v.play().catch(() => setPlaying(false));
        else v.pause();
      },
      { threshold: 0.2 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [hasVideo, isMobile]);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      wantsPlay.current = true;
      v.play().catch(() => undefined);
    } else {
      wantsPlay.current = false;
      v.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted && v.paused) {
      wantsPlay.current = true;
      v.play().catch(() => undefined);
    }
  }, []);

  return (
    <figure
      className="relative h-full w-full"
      data-cursor={hasVideo ? (playing ? 'pause' : 'play') : undefined}
      onClick={(e) => {
        if (!hasVideo || (e.target as Element).closest('button')) return;
        togglePlay();
      }}
    >
      <div data-hero-media-inner className="absolute inset-0 will-change-transform">
        {!hasVideo && founderVideo.portrait && <FounderPortrait webp={founderVideo.portrait.webp} jpg={founderVideo.portrait.jpg} />}
        {!hasVideo && !founderVideo.portrait && <VideoPlaceholder />}
        {hasVideo && sources && (
          <video
            key={isMobile ? 'mobile' : 'desktop'}
            ref={videoRef}
            className={cn('absolute inset-0 h-full w-full object-cover transition-opacity duration-700', ready ? 'opacity-100' : 'opacity-0')}
            poster={founderVideo.poster ?? undefined}
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={`Video introduction from ${site.founder.name}, founder of DeepVibe`}
            onLoadedData={() => setReady(true)}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          >
            {sources.webm && <source src={sources.webm} type="video/webm" />}
            {sources.mp4 && <source src={sources.mp4} type="video/mp4" />}
          </video>
        )}
        {/* poster shows instantly while the video buffers */}
        {hasVideo && founderVideo.poster && !ready && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={founderVideo.poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
        )}
      </div>

      {/* cinematic grading + legibility */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(11,13,15,0.45)_0%,transparent_22%,transparent_58%,rgba(11,13,15,0.85)_100%)]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 shadow-[inset_0_0_120px_rgba(11,13,15,0.6)]" />

      {/* viewfinder corners */}
      {(['left-4 top-4 border-l border-t', 'right-4 top-4 border-r border-t', 'left-4 bottom-4 border-l border-b', 'right-4 bottom-4 border-r border-b'] as const).map((pos) => (
        <span key={pos} aria-hidden className={cn('pointer-events-none absolute h-4 w-4 border-lime/60', pos)} />
      ))}

      {/* top bar */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-6 md:p-7">
        <span className="label flex items-center gap-2 text-warm/85">
          <span className={cn('h-1.5 w-1.5 rounded-full bg-lime', (playing || !hasVideo) && 'animate-blink motion-reduce:animate-none')} />
          <span className="vibe-hide">{hasVideo ? 'Founder film' : 'Meet the founder'}</span>
          <span className="vibe-show items-center gap-2 text-lime">
            <span aria-hidden className="flex h-2.5 items-end gap-[2px]">
              {[1.6, 0.9, 1.3, 0.7].map((m, i) => (
                <span key={i} className="dz-np-bar block w-[2px] origin-bottom rounded-full bg-lime" style={{ ['--m' as string]: m }} />
              ))}
            </span>
            Now playing
          </span>
        </span>
        {hasVideo && (
          <button
            type="button"
            onClick={toggleMute}
            aria-pressed={!muted}
            aria-label={muted ? 'Turn sound on' : 'Mute video'}
            className="glass grid h-9 w-9 place-items-center rounded-full text-warm transition-colors hover:text-lime"
          >
            {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
        )}
      </div>

      {/* caption */}
      <figcaption className="absolute inset-x-0 bottom-0 p-6 md:p-7">
        {founderVideo.caption && (
          <p className="mb-4 max-w-[18ch] font-display text-lg sm:text-[1.375rem] font-medium leading-[1.1] tracking-[-0.02em] text-warm md:text-2xl">
            “{founderVideo.caption}”
          </p>
        )}
        <div className="flex items-end justify-between gap-4 border-t border-white/10 pt-4">
          <div>
            <p className="font-display text-base font-medium text-warm">{site.founder.name}</p>
            <p className="label mt-1.5 text-muted">{site.founder.role}</p>
          </div>
          {hasVideo && (
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? 'Pause founder video' : 'Play founder video'}
              className="group grid h-12 w-12 place-items-center rounded-full bg-lime text-void transition-transform duration-500 ease-expo hover:scale-105"
            >
              {playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="translate-x-[1px]" />}
            </button>
          )}
        </div>
      </figcaption>
    </figure>
  );
}
