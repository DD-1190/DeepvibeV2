import type { Metadata } from 'next';
import { ArrowUpRight } from 'lucide-react';
import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/layout/Footer';
import { formatDate, posts, renderPost } from '@/lib/journal';

export const metadata: Metadata = {
  title: 'Journal',
  description: 'Essays and notes from DeepVibe on AI-native products, emerging technology and the craft of product design.',
  alternates: { canonical: '/journal' },
};

export default function JournalPage() {
  return (
    <>
      <Navbar />
      <main id="main" className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-lime/[0.06] blur-[120px]" />
        <section className="container-dv pb-16 pt-40 md:pb-24 md:pt-52">
          <p className="label flex items-center gap-3 text-muted">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-lime" />
            Journal · Insights
          </p>
          <h1 className="mt-8 max-w-[16ch] font-display text-[clamp(2.75rem,6vw,5.5rem)] font-medium leading-[0.98] tracking-[-0.045em] text-warm">
            Notes on building what comes <span className="text-lime">next.</span>
          </h1>
          <p className="mt-8 max-w-[52ch] text-lg leading-relaxed text-muted md:text-xl">
            Essays and short notes on AI-native products, emerging technology and the craft of product design — ideas in progress, shared to start conversations.
          </p>
        </section>

        <section aria-label="Articles" className="container-dv pb-28 md:pb-40">
          <ul className="border-t border-white/[0.08]">
            {posts.map((p) => {
              const { minutes } = renderPost(p.slug);
              return (
                <li key={p.slug} className="border-b border-white/[0.08]">
                  <a href={`/journal/${p.slug}`} className="group grid gap-6 py-10 md:grid-cols-12 md:gap-8 md:py-14">
                    <div className="label flex flex-col gap-2 text-muted md:col-span-3">
                      <span>{formatDate(p.date)}</span>
                      <span>{minutes} min read</span>
                    </div>
                    <div className="md:col-span-8">
                      <p className="label mb-4 text-lime/90">{p.topics.join(' · ')}</p>
                      <h2 className="font-display text-[clamp(1.6rem,3vw,2.5rem)] font-medium leading-[1.08] tracking-[-0.03em] text-warm transition-colors duration-300 group-hover:text-lime">
                        {p.title}
                      </h2>
                      <p className="mt-5 max-w-[62ch] leading-relaxed text-muted">{p.dek}</p>
                    </div>
                    <div className="flex items-start md:col-span-1 md:justify-end">
                      <span className="grid h-12 w-12 place-items-center rounded-full border border-white/15 text-warm transition-all duration-500 ease-expo group-hover:border-lime group-hover:bg-lime group-hover:text-void">
                        <ArrowUpRight size={18} />
                      </span>
                    </div>
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
}
