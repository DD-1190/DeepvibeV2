import type { Service } from '@/data/site';

/**
 * Small looping line illustrations, one per service. Pure SVG + CSS keyframes
 * (see globals.css → "Section 05"), so they cost nothing to load. Disabled for reduced motion.
 */
const LIME = '#B9F56B';
const LINE = 'rgba(233,237,229,0.22)';
const FAINT = 'rgba(233,237,229,0.08)';

function Strategy() {
  const dots = [
    [88, 70],
    [318, 58],
    [300, 186],
    [110, 182],
    [250, 40],
    [150, 120],
  ];
  return (
    <>
      {[34, 68, 102].map((r) => (
        <circle key={r} cx="200" cy="120" r={r} fill="none" stroke={LINE} />
      ))}
      <line x1="80" y1="120" x2="320" y2="120" stroke={FAINT} />
      <line x1="200" y1="10" x2="200" y2="230" stroke={FAINT} />
      {/* radar sweep */}
      <g className="svc-spin">
        <path d="M200 120 L200 18 A102 102 0 0 1 288 69 Z" fill="url(#sweep)" />
        <line x1="200" y1="120" x2="200" y2="18" stroke={LIME} strokeOpacity="0.8" />
      </g>
      {/* insights converging on a direction */}
      {dots.map(([x, y], i) => (
        <g key={i}>
          <line x1={x} y1={y} x2="200" y2="120" stroke={LIME} strokeOpacity="0.5" pathLength={1} className="svc-draw" style={{ animationDelay: `${i * 0.35}s` }} />
          <circle cx={x} cy={y} r="3.5" fill={LIME} className="svc-pulse" style={{ animationDelay: `${i * 0.35}s` }} />
        </g>
      ))}
      <circle cx="200" cy="120" r="6" fill={LIME} />
      <defs>
        <linearGradient id="sweep" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={LIME} stopOpacity="0.28" />
          <stop offset="1" stopColor={LIME} stopOpacity="0" />
        </linearGradient>
      </defs>
    </>
  );
}

function Experience() {
  const frame = (x: number) => (
    <g>
      <rect x={x} y="34" width="128" height="172" rx="14" fill="rgba(32,37,42,0.6)" stroke={LINE} />
      <rect x={x + 14} y="52" width="54" height="8" rx="4" fill={LINE} />
      <rect x={x + 14} y="72" width="100" height="44" rx="8" fill={FAINT} stroke={LINE} />
      <rect x={x + 14} y="128" width="100" height="6" rx="3" fill={FAINT} />
      <rect x={x + 14} y="142" width="72" height="6" rx="3" fill={FAINT} />
      <rect x={x + 14} y="172" width="48" height="20" rx="10" fill={x > 200 ? LIME : 'none'} stroke={LIME} strokeOpacity="0.7" />
    </g>
  );
  const flow = 'M100 182 C 150 230, 210 230, 250 82';
  return (
    <>
      {frame(36)}
      {frame(236)}
      <path d={flow} fill="none" stroke={LIME} strokeWidth="1.5" strokeDasharray="4 5" strokeOpacity="0.7" />
      <path d={flow} fill="none" stroke={LIME} strokeWidth="1.5" pathLength={1} className="svc-draw" />
      {/* cursor travelling the flow */}
      <g className="svc-cursor" style={{ offsetPath: `path('${flow}')` }}>
        <path d="M0 0 L0 16 L4.5 12 L8 19 L11 17.5 L7.5 10.8 L13 10.8 Z" fill="#E9EDE5" stroke="#0B0D0F" strokeWidth="1" />
      </g>
    </>
  );
}

function Systems() {
  const cols = 6;
  const rows = 3;
  const tiles = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      tiles.push(
        <rect
          key={i}
          x={148 + c * 38}
          y={52 + r * 48}
          width="30"
          height={r === 1 ? 18 : 30}
          rx={r === 2 ? 15 : 6}
          fill={LIME}
          stroke={LINE}
          className="svc-tile"
          style={{ animationDelay: `${(c + r) * 0.12}s` }}
        />,
      );
    }
  return (
    <>
      {/* source token */}
      <rect x="28" y="96" width="70" height="48" rx="10" fill="rgba(32,37,42,0.7)" stroke={LIME} strokeOpacity="0.8" />
      <circle cx="48" cy="120" r="8" fill={LIME} />
      <rect x="62" y="114" width="26" height="4" rx="2" fill={LINE} />
      <rect x="62" y="122" width="18" height="4" rx="2" fill={FAINT} />
      {[70, 120, 170].map((y, i) => (
        <path
          key={y}
          d={`M98 120 C 120 120, 120 ${y}, 142 ${y}`}
          fill="none"
          stroke={LIME}
          strokeOpacity="0.6"
          pathLength={1}
          className="svc-draw"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
      {tiles}
    </>
  );
}

function Brand() {
  const swatches = ['#0B0D0F', '#20252A', '#A5AAAD', '#E9EDE5', LIME];
  return (
    <>
      {/* type guides */}
      {[64, 112, 160].map((y) => (
        <line key={y} x1="24" y1={y} x2="236" y2={y} stroke={FAINT} strokeDasharray="3 4" />
      ))}
      <text x="30" y="160" fontFamily='"Space Grotesk Variable", sans-serif' fontSize="120" fontWeight="500" letterSpacing="-6" fill="#E9EDE5">
        Aa
      </text>
      <rect x="24" y="40" width="2" height="150" fill={LIME} className="svc-scan" />
      <text x="30" y="196" fontFamily='"IBM Plex Mono", monospace' fontSize="9" letterSpacing="1.5" fill="rgba(165,170,173,0.9)">
        SPACE GROTESK · 500
      </text>
      {/* palette */}
      {swatches.map((c, i) => (
        <circle
          key={c}
          cx={286 + (i % 2) * 52}
          cy={58 + Math.floor(i / 2) * 52}
          r="20"
          fill={c}
          stroke={LINE}
          className="svc-swatch"
          style={{ animationDelay: `${i * 0.25}s` }}
        />
      ))}
    </>
  );
}

const MAP = { strategy: Strategy, experience: Experience, systems: Systems, brand: Brand } as const;

export function ServiceGlyph({ type }: { type: Service['glyph'] }) {
  const G = MAP[type];
  return (
    <svg viewBox="0 0 400 240" className="h-auto w-full" aria-hidden role="presentation">
      <G />
    </svg>
  );
}
