const isStaticExport = process.env.STATIC_EXPORT === '1';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // API routes are named `route.api.ts` so they are only compiled for server builds (Vercel / `next start`).
  // A static export simply has no /api — the project assistant then runs its scripted flow.
  pageExtensions: isStaticExport ? ['tsx', 'ts', 'jsx', 'js'] : ['api.ts', 'tsx', 'ts', 'jsx', 'js'],
  // `STATIC_EXPORT=1 npm run build` writes a fully static site to /out
  // (handy for self-hosting on any server). Default build targets Vercel / `next start`.
  ...(isStaticExport ? { output: 'export', trailingSlash: true, images: { unoptimized: true } } : {}),
};

export default nextConfig;
