'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Play, Volume2, VolumeX } from 'lucide-react';
import { founderVideo, site } from '@/data/site';
import { cn } from '@/lib/cn';
import { VideoPlaceholder } from './VideoPlaceholder';
import { FounderPortrait } from './FounderPortrait';

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;

/**
 * Founder film — click to play, never autoplays.
 * - Poster frame first; nothing but metadata downloads until the visitor presses play
 * - Plays with sound (it's a user gesture); minimal centred play control, thin progress line, mute toggle
 * - Click the film to pause/resume; pauses when scrolled away; returns to the poster when it ends
 * - Edges graded/feathered into the page (see .hero-media-blend / .founder-grade in globals.css)
 * - Falls back to the still portrait (or placeholder) if no source is set or the file fails
 */
export function FounderVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState<number | null>(null);

  const src = founderVideo.mp4 || founderVideo.webm;
  const hasVideo = !!src && !failed;

  // metadata may load before hydration attaches handlers
  useEffect(() => {
    const v = videoRef.current;
    if (v && v.readyState >= 1 && v.duration) setDuration(v.duration);
  }, [hasVideo]);

  // pause when scrolled away (never auto-resume)
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !hasVideo) return;
    const io = new IntersectionObserver(([e]) => !e.isIntersecting && !v.paused && v.pause(), { threshold: 0.15 });
    io.observe(v);
    return () => io.disconnect();
  }, [hasVideo]);

  const toggle = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      setStarted(true);
      v.muted = muted;
      v.play().catch(() => {
        // some browsers refuse sound without a "real" gesture — retry muted
        v.muted = true;
        setMuted(true);
        v.play().catch(() => undefined);
      });
    } else v.pause();
  }, [muted]);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }, []);

  return (
    <figure
      className={cn('founder-film relative h-full w-full', playing && 'is-playing')}
      data-cursor={hasVideo ? (playing ? 'pause' : 'play') : undefined}
      onClick={(e) => {
        if (!hasVideo || (e.target as Element).closest('button')) return;
        toggle();
      }}
    >
      <div data-hero-media-inner className="absolute inset-0 will-change-transform">
        {!hasVideo && founderVideo.portrait && <FounderPortrait webp={founderVideo.portrait.webp} jpg={founderVideo.portrait.jpg} />}
        {!hasVideo && !founderVideo.portrait && <VideoPlaceholder />}
        {hasVideo && (
          <video
            ref={videoRef}
            className="founder-grade absolute inset-0 h-full w-full object-cover object-[50%_30%]"
            poster={founderVideo.poster ?? undefined}
            playsInline
            preload="metadata"
            aria-label={`Video introduction from ${site.founder.name}, founder of DeepVibe`}
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || null)}
            onTimeUpdate={(e) => {
              const v = e.currentTarget;
              setProgress(v.duration ? v.currentTime / v.duration : 0);
            }}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={(e) => {
              const v = e.currentTarget;
              setPlaying(false);
              setStarted(false);
              setProgress(0);
              v.currentTime = 0;
              v.load(); // back to the poster frame
            }}
            onError={() => setFailed(true)}
          >
            {founderVideo.webm && <source src={founderVideo.webm} type="video/webm" />}
            {founderVideo.mp4 && <source src={founderVideo.mp4} type="video/mp4" />}
          </video>
        )}
      </div>

      {/* blend: tint + soft vignette so the film sits in the page instead of on it */}
      <div aria-hidden className="founder-tint pointer-events-none absolute inset-0" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(11,13,15,0.35)_0%,transparent_20%,transparent_55%,rgba(11,13,15,0.92)_100%)]" />

      {/* centred play control — the only control until the film starts */}
      {hasVideo && (
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? 'Pause founder video' : started ? 'Resume founder video' : 'Play founder video'}
          className={cn(
            'founder-play absolute left-1/2 top-[44%] flex -translate-x-1/2 -translate-y-1/2 items-center gap-3 rounded-full py-2 pl-2 pr-4 text-warm',
            playing && 'pointer-events-none opacity-0',
          )}
        >
          <span className="grid h-11 w-11 place-items-center rounded-full bg-lime text-void">
            <Play size={15} fill="currentColor" className="translate-x-[1px]" />
          </span>
          <span className="label text-[0.625rem] text-warm/90">
            {started ? 'Resume' : 'Play intro'}
            {duration ? <span className="ml-2 text-muted">{fmt(duration)}</span> : null}
          </span>
        </button>
      )}

      {/* mute — only once the film has started */}
      {hasVideo && started && (
        <button
          type="button"
          onClick={toggleMute}
          aria-pressed={!muted}
          aria-label={muted ? 'Turn sound on' : 'Mute video'}
          className="glass absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full text-warm transition-colors hover:text-lime md:right-6 md:top-6"
        >
          {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
      )}

      {/* caption */}
      <figcaption className="absolute inset-x-0 bottom-0 p-6 md:p-7">
        {founderVideo.caption && (
          <p className="mb-4 max-w-[18ch] font-display text-lg font-medium leading-[1.1] tracking-[-0.02em] text-warm sm:text-[1.375rem] md:text-2xl">
            “{founderVideo.caption}”
          </p>
        )}
        <div className="relative pt-4">
          <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-white/10" />
          {hasVideo && (
            <span
              aria-hidden
              className="absolute left-0 top-0 h-px bg-lime transition-[width] duration-200 ease-linear"
              style={{ width: `${progress * 100}%` }}
            />
          )}
          <p className="font-display text-base font-medium text-warm">{site.founder.name}</p>
          <p className="label mt-1.5 text-muted">{site.founder.role}</p>
        </div>
      </figcaption>
    </figure>
  );
}
