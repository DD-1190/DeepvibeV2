import { Navbar } from '@/components/navigation/Navbar';
import { Hero } from '@/components/hero/Hero';
import { Philosophy } from '@/components/sections/Philosophy';
import { SelectedWork } from '@/components/sections/SelectedWork';
import { Services } from '@/components/sections/Services';
import { About } from '@/components/sections/About';
import { Proof } from '@/components/sections/Proof';
import { Contact } from '@/components/sections/Contact';
import { Footer } from '@/components/layout/Footer';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="main">
        {/* 02 — Hero */}
        <Hero />
        {/* 03 — Philosophy */}
        <Philosophy />
        {/* 04 — Selected work */}
        <SelectedWork />
        {/* 05 — Services & capabilities */}
        <Services />
        {/* 06 — Our approach: not built yet (skipped for now) */}
        {/* 07 — About the founder */}
        <About />
        {/* 08 — Social proof */}
        <Proof />
        {/* 09 — Final CTA + enquiry */}
        <Contact />
      </main>
      {/* 10 — Footer */}
      <Footer />
    </>
  );
}
