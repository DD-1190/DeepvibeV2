import { site } from '@/data/site';

/** Still founder portrait shown in the hero until a video is added. No looping animation. */
export function FounderPortrait({ webp, jpg }: { webp: string; jpg: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-void">
      <picture>
        <source srcSet={webp} type="image/webp" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={jpg}
          alt={`Portrait of ${site.founder.name}, founder of DeepVibe`}
          width={1080}
          height={1350}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-[50%_30%]"
        />
      </picture>
    </div>
  );
}
