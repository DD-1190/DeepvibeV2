export function ScrollIndicator({ href = '#work' }: { href?: string }) {
  return (
    <a href={href} className="group inline-flex items-center gap-3 text-muted transition-colors hover:text-warm" aria-label="Scroll to next section">
      <span className="relative h-10 w-px overflow-hidden bg-white/10">
        <span className="absolute inset-0 animate-scroll-line bg-lime motion-reduce:animate-none" />
      </span>
      <span className="label">Scroll</span>
    </a>
  );
}
