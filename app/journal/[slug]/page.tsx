import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { site } from '@/data/site';
import { formatDate, getPost, posts, renderPost } from '@/lib/journal';

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  return {
    title: { absolute: post.title },
    description: post.dek,
    alternates: { canonical: `/journal/${post.slug}` },
    authors: [{ name: post.author }],
    openGraph: { type: 'article', title: post.title, description: post.dek, publishedTime: post.date, authors: [post.author] },
    twitter: { card: 'summary_large_image', title: post.title, description: post.dek },
  };
}

/** The D-chevron mark (Bone + Signal Lime). */
function Mark({ size = 44 }: { size?: number }) {
  return (
    <svg viewBox="0 0 512 512" width={size} height={size} aria-hidden className="shrink-0">
      <path fill="#B9F56B" d="M176 329 L368 329 C386 355 388 400 373 432 L335 475 Q302 512 252 512 L0 512 Z" />
      <path fill="#F3F4EF" d="M0 0 L290 0 Q344 0 382 38 L477 133 Q509 165 509 210 L509 235 Q509 280 479 314 L373 432 C388 400 386 355 368 329 C360 300 345 276 313 250 Z" />
    </svg>
  );
}

export default async function PostPage({ params }: Params) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const { html, minutes } = renderPost(post.slug);
  const linkedin = site.socials.find((s) => s.label === 'LinkedIn');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.dek,
    datePublished: post.date,
    author: { '@type': 'Person', name: post.author },
    publisher: { '@type': 'Organization', name: site.name, logo: { '@type': 'ImageObject', url: `${site.url}/icon-512.png` } },
    mainEntityOfPage: `${site.url}/journal/${post.slug}`,
  };

  return (
    <>
      <Navbar />
      <main id="main" className="relative overflow-hidden">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <div aria-hidden className="pointer-events-none absolute -left-40 top-0 h-[520px] w-[520px] rounded-full bg-lime/[0.05] blur-[120px]" />

        <article>
          <header className="container-dv pb-14 pt-36 md:pb-20 md:pt-48">
            <div className="mx-auto max-w-[52rem]">
              <a href="/journal" className="label inline-flex items-center gap-2 text-muted transition-colors hover:text-lime">
                <ArrowLeft size={14} /> Journal
              </a>
              <p className="label mt-10 flex items-center gap-3 text-muted">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-lime" />
                Essay · {post.topics.join(' · ')}
              </p>
              <h1 className="mt-6 font-display text-[clamp(2.25rem,5vw,4.25rem)] font-medium leading-[1.02] tracking-[-0.04em] text-warm">
                {post.title}
              </h1>
              <p className="mt-8 text-lg leading-relaxed text-muted md:text-xl">{post.dek}</p>
              <p className="label mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/[0.08] pt-6 text-muted">
                <span className="text-warm/85">By {post.author}</span>
                <span aria-hidden className="h-1 w-1 rounded-full bg-lime" />
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                <span aria-hidden className="h-1 w-1 rounded-full bg-lime" />
                <span>{minutes} min read</span>
              </p>
            </div>
          </header>

          <div className="container-dv">
            <div className="prose-dv mx-auto max-w-[44rem]" dangerouslySetInnerHTML={{ __html: html }} />

            {/* author */}
            <aside aria-label="About the author" className="mx-auto mt-20 max-w-[44rem] rounded-[28px] border border-white/[0.08] bg-surface/60 p-7 md:mt-28 md:p-9">
              <div className="flex items-center gap-4">
                <Mark />
                <div>
                  <p className="font-display text-lg font-medium text-warm">{post.author}</p>
                  <p className="label mt-1 text-muted">Founder, {site.name}</p>
                </div>
              </div>
              <p className="mt-6 leading-relaxed text-muted">
                Naman is the founder of DeepVibe, an independent digital product design studio, with 15+ years of designing digital products. He writes here about how
                products, people and new technology meet. If this piece made you think of a habit, a product or an argument he&apos;s missed, he&apos;d like to hear it — and
                if you&apos;re building something in this space, he&apos;d like to hear about that too.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <MagneticButton href="/#contact" openChat size="sm">
                  Start a conversation
                </MagneticButton>
                {linkedin && (
                  <a href={linkedin.href} target="_blank" rel="noreferrer" className="inline-flex min-h-[2.75rem] items-center gap-1.5 px-2 text-warm/85 transition-colors hover:text-lime">
                    DeepVibe on LinkedIn <ArrowUpRight size={16} />
                  </a>
                )}
              </div>
            </aside>

            {/* sources */}
            <section aria-labelledby="sources-title" className="mx-auto mb-28 mt-16 max-w-[44rem] md:mb-40">
              <h2 id="sources-title" className="label text-warm/70">
                Sources
              </h2>
              <p className="mt-3 text-sm text-muted">Dates and figures come from these sources; everything else is the author&apos;s interpretation.</p>
              <ol className="mt-6 space-y-4 border-t border-white/[0.08] pt-6">
                {post.sources.map((s, i) => (
                  <li key={s.href} className="grid grid-cols-[2.25rem_1fr] text-sm leading-relaxed">
                    <span className="label pt-0.5 text-muted">{String(i + 1).padStart(2, '0')}</span>
                    <span>
                      <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-warm/90 underline decoration-white/20 underline-offset-4 transition-colors hover:text-lime hover:decoration-lime">
                        {s.title}
                      </a>
                      <span className="block text-muted">{s.note}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
