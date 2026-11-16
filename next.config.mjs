const isStaticExport = process.env.STATIC_EXPORT === '1';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // `STATIC_EXPORT=1 npm run build` writes a fully static site to /out
  // (handy for self-hosting on any server). Default build targets Vercel / `next start`.
  ...(isStaticExport ? { output: 'export', trailingSlash: true, images: { unoptimized: true } } : {}),
};

export default nextConfig;
