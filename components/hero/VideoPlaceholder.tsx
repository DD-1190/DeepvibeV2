/**
 * Shown until the real founder film is added in data/site.ts.
 * Deliberately abstract — a camera reticle, rim light and a voice waveform —
 * so it reads as "film goes here" without inventing a face.
 */
const BARS = [0.35, 0.6, 0.9, 0.5, 0.75, 1, 0.55, 0.8, 0.4, 0.95, 0.65, 0.45, 0.85, 0.6, 0.3, 0.7, 0.9, 0.5, 0.65, 0.4, 0.8, 0.55, 0.35];

export function VideoPlaceholder() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-graphite" role="img" aria-label="Placeholder for the founder video of Naman Rampal">
      {/* studio light */}
      <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_15%_105%,rgba(185,245,107,0.24),transparent_60%),radial-gradient(70%_60%_at_85%_0%,rgba(233,237,229,0.08),transparent_60%),linear-gradient(180deg,#20252A_0%,#0B0D0F_100%)]" />
      <div className="absolute -left-10 top-1/4 h-2/3 w-16 rounded-full bg-lime/25 blur-3xl" />
      {/* backdrop seamless-paper falloff */}
      <div className="absolute inset-x-0 top-[51%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* reticle */}
      <div className="absolute left-1/2 top-[30%] -translate-x-1/2 -translate-y-1/2">
        <svg viewBox="0 0 168 168" fill="none" className="h-[112px] w-[112px] opacity-80 sm:h-[148px] sm:w-[148px]">
          <g className="origin-center animate-spin-slow motion-reduce:animate-none" style={{ transformBox: 'fill-box' }}>
            <circle cx="84" cy="84" r="80" stroke="rgba(233,237,229,0.14)" strokeDasharray="2 6" />
          </g>
          <circle cx="84" cy="84" r="54" stroke="rgba(233,237,229,0.18)" />
          <circle cx="84" cy="84" r="3" fill="#B9F56B" />
          {[0, 90, 180, 270].map((a) => (
            <line
              key={a}
              x1="84"
              y1="22"
              x2="84"
              y2="34"
              stroke="#B9F56B"
              strokeOpacity="0.7"
              transform={`rotate(${a} 84 84)`}
            />
          ))}
        </svg>
      </div>

      <div className="absolute inset-x-0 top-[54%] flex flex-col items-center gap-2 px-6 text-center">
        <p className="label text-warm/80">Video placeholder</p>
        <p className="font-mono text-[0.625rem] leading-relaxed text-muted/70">
          Add founder.webm / founder.mp4 in <span className="text-lime/80">data/site.ts</span>
        </p>
      </div>

      {/* voice waveform */}
      <div className="absolute inset-x-0 top-[46%] flex h-6 items-center justify-center gap-[3px]">
        {BARS.map((h, i) => (
          <span
            key={i}
            className="w-[2px] animate-wave rounded-full bg-lime/70 motion-reduce:animate-none"
            style={{ height: `${h * 100}%`, animationDelay: `${(i % 7) * 0.12 + i * 0.03}s` }}
          />
        ))}
      </div>
    </div>
  );
}
