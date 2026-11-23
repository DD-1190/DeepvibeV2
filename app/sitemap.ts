import type { MetadataRoute } from 'next';
import { site } from '@/data/site';
import { posts } from '@/lib/journal';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: `${site.url}/journal`, lastModified: new Date(posts[0]?.date ?? Date.now()), changeFrequency: 'weekly', priority: 0.8 },
    ...posts.map((p) => ({ url: `${site.url}/journal/${p.slug}`, lastModified: new Date(p.date), changeFrequency: 'yearly' as const, priority: 0.7 })),
  ];
}
