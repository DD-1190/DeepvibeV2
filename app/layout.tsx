import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/space-grotesk';
import '@fontsource-variable/inter';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import './globals.css';
import { site } from '@/data/site';
import { ContactChatModal } from '@/components/chat/ContactChatModal';
import { CustomCursor } from '@/components/cursor/CustomCursor';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: 'DeepVibe — Independent Digital Product Design Studio',
    template: '%s — DeepVibe',
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.founder.name }],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: site.url,
    siteName: site.name,
    title: 'DeepVibe — We design what comes next.',
    description: 'Strategy, design and technology for businesses ready to build what’s next.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DeepVibe — We design what comes next.',
    description: 'Strategy, design and technology for businesses ready to build what’s next.',
  },
};

export const viewport: Viewport = {
  themeColor: '#0B0D0F',
  colorScheme: 'dark',
};

// Marks the document as animation-ready before first paint (prevents a flash of
// un-animated hero content). Skipped for reduced-motion users so nothing is hidden.
const motionScript = `try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('motion-ok')}catch(e){}`;

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: site.name,
  url: site.url,
  logo: `${site.url}/icon-512.png`,
  image: `${site.url}/icon-512.png`,
  description: site.description,
  slogan: site.tagline,
  founder: { '@type': 'Person', name: site.founder.name },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="grain">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-lime focus:px-4 focus:py-2 focus:text-void"
        >
          Skip to content
        </a>
        {children}
        <CustomCursor />
        <ContactChatModal />
      </body>
    </html>
  );
}
