const isStaticExport = process.env.STATIC_EXPORT === '1';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // `STATIC_EXPORT=1 npm run build` writes a fully static site to /out
  // (handy for self-hosting on any server). Use `npm run build:static` — it sets app/api aside, since a
  // static site has no server; the project assistant then runs its scripted flow. Default build targets Vercel.
  ...(isStaticExport ? { output: 'export', trailingSlash: true, images: { unoptimized: true } } : {}),
};

export default nextConfig;
