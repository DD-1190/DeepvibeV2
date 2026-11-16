/**
 * Ambient hero backdrop: graphite vignette, slow-drifting lime light, a masked
 * editorial grid and a cursor-following spotlight (driven by --mx / --my on the hero).
 * Pure CSS — no canvas, no WebGL — so it costs almost nothing.
 */
export function HeroBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_78%_35%,#171B1E_0%,#0B0D0F_62%)]" />

      {/* drifting cinematic light */}
      <div className="absolute right-[-12%] top-[8%] h-[62vmax] w-[62vmax] animate-drift rounded-full bg-[radial-gradient(circle,rgba(185,245,107,0.13)_0%,rgba(185,245,107,0.04)_38%,transparent_68%)] motion-reduce:animate-none" />
      <div className="absolute bottom-[-30%] left-[-20%] h-[55vmax] w-[55vmax] animate-drift-slow rounded-full bg-[radial-gradient(circle,rgba(165,170,173,0.07)_0%,transparent_65%)] motion-reduce:animate-none" />

      {/* vibe-mode pulse (see VibeToggle) */}
      <div data-vibe-glow className="absolute right-[-10%] top-[5%] h-[70vmax] w-[70vmax] rounded-full bg-[radial-gradient(circle,rgba(185,245,107,0.22)_0%,transparent_60%)] opacity-0" />

      {/* editorial column grid */}
      <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_80%_70%_at_50%_40%,#000_30%,transparent_85%)]">
        <div className="container-dv h-full">
          <div className="grid h-full grid-cols-4 border-x border-white/[0.04] md:grid-cols-6 lg:grid-cols-12">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className={`border-r border-white/[0.035] last:border-r-0 ${i >= 4 ? 'hidden md:block' : ''} ${i >= 6 ? 'md:hidden lg:block' : ''}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* cursor spotlight */}
      <div className="absolute inset-0 bg-[radial-gradient(520px_circle_at_var(--mx,70%)_var(--my,40%),rgba(185,245,107,0.07),transparent_60%)] transition-opacity duration-700" />

      {/* floor fade into the next section */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-void" />
    </div>
  );
}
