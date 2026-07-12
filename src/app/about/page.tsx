import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About the Brand | FASHION & CO.',
  description: 'Learn about FASHION & CO., Nairobi\'s definitive destination for curated luxury fashion and ethical elegance.',
};

export default function AboutPage() {
  return (
    <div className="bg-[#fef8fc] font-montserrat text-[#1d1b1e] overflow-x-hidden">
      {/* Hero */}
      <section className="relative w-full h-[70vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1558171813-ec96f5a0a5a8?w=2000&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-[#430562]/50" />
        <div className="absolute bottom-16 left-12 z-10 max-w-lg">
          <p className="font-montserrat text-[12px] uppercase tracking-[0.2em] text-white/60 mb-4">Est. 2017 — Nairobi, Kenya</p>
          <h1 className="font-playfair text-[56px] md:text-[72px] font-bold text-white leading-none mb-4">
            Our Story
          </h1>
          <div className="h-1 w-12 bg-[#c89b3c]" />
        </div>
      </section>

      {/* Brand Story */}
      <section className="max-w-7xl mx-auto py-24 px-6 md:px-12">
        <div className="grid grid-cols-12 gap-8 items-center">
          <div className="col-span-12 md:col-span-5">
            <p className="font-montserrat text-[12px] uppercase tracking-[0.15em] text-[#7e7480] mb-4">The Beginning</p>
            <h2 className="font-playfair text-[40px] font-bold text-[#430562] leading-tight mb-6">
              Born From a Vision of African Luxury
            </h2>
            <div className="h-1 w-12 bg-[#c89b3c] mb-8" />
          </div>
          <div className="col-span-12 md:col-span-6 md:col-start-7">
            <p className="font-montserrat text-[16px] text-[#4d444f] leading-relaxed mb-6">
              FASHION & CO. was founded with a singular purpose: to create a space where African craftsmanship meets contemporary luxury. What began as a small atelier in the heart of Nairobi has grown into the continent's most revered fashion destination.
            </p>
            <p className="font-montserrat text-[16px] text-[#4d444f] leading-relaxed">
              Our founder believed that true elegance is rooted in heritage. Every piece in our collection tells a story — of the artisans who crafted it, the traditions that inspired it, and the woman who wears it.
            </p>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="bg-[#f2ecf0] py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="font-playfair text-[40px] font-bold text-[#430562] mb-4">Our Values</h3>
            <div className="h-1 w-20 bg-[#c89b3c] mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path d="M16 4L20 12L29 13.5L22.5 20L24 29L16 25L8 29L9.5 20L3 13.5L12 12L16 4Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                  </svg>
                ),
                bg: 'bg-[#430562]',
                title: 'Craftsmanship',
                desc: 'We partner with master artisans across the continent, ensuring every stitch reflects decades of passed-down wisdom and meticulous attention to detail.',
              },
              {
                icon: (
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <circle cx="11" cy="9" r="4" stroke="white" strokeWidth="1.5"/>
                    <circle cx="21" cy="9" r="4" stroke="white" strokeWidth="1.5"/>
                    <path d="M3 27C3 22 6.6 18 11 18M29 27C29 22 25.4 18 21 18M13 27C13 22 14.8 18 16 18C17.2 18 19 22 19 27" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                ),
                bg: 'bg-[#5b247a]',
                title: 'Community',
                desc: 'Beyond fashion, we are a hub for creative growth. 15% of our proceeds go directly into Nairobi-based artisanal education and micro-finance initiatives.',
                offset: true,
              },
              {
                icon: (
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path d="M16 6L17.5 11H22.5L18.5 14L20 19L16 16L12 19L13.5 14L9.5 11H14.5L16 6Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                    <path d="M8 24C10.5 21 13 20 16 20C19 20 21.5 21 24 24" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                ),
                bg: 'bg-[#642d83]',
                title: 'Elegance',
                desc: 'Elegance is our baseline. We design for longevity, creating pieces that remain as striking a decade from now as they are today.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className={`bg-white p-10 border border-[#cfc2d1]/30 hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center ${item.offset ? 'md:translate-y-8' : ''}`}
              >
                <div className={`w-16 h-16 rounded-full ${item.bg} flex items-center justify-center mb-8`}>
                  {item.icon}
                </div>
                <h4 className="font-playfair text-[24px] font-semibold text-[#430562] mb-4">{item.title}</h4>
                <p className="font-montserrat text-[16px] text-[#4d444f] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Asymmetric Detail Section */}
      <section className="max-w-7xl mx-auto py-24 px-6 md:px-12">
        <div className="grid grid-cols-12 gap-8 items-center">
          <div className="col-span-12 md:col-span-7 relative">
            <img
              src="https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=1200&q=80"
              alt="Curated jewelry on marble"
              className="w-full h-[500px] object-cover"
            />
          </div>
          <div className="col-span-12 md:col-span-4 md:col-start-9">
            <h3 className="font-playfair text-[32px] font-bold text-[#430562] mb-6">The Curator's Eye</h3>
            <p className="font-montserrat text-[18px] text-[#4d444f] italic mb-8 leading-relaxed">
              "Style is a silent language. At FASHION & CO., we provide the vocabulary."
            </p>
            <ul className="space-y-4">
              {[
                'Ethically Sourced Gold',
                'Hand-Woven Silks',
                'Limited Production Runs',
              ].map((item) => (
                <li key={item} className="flex items-center gap-4 text-[#430562]">
                  <div className="w-5 h-5 rounded-full bg-[#c89b3c] flex items-center justify-center shrink-0">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="font-montserrat text-[14px] font-semibold uppercase tracking-wider">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#430562] py-24 px-6 text-center overflow-hidden relative">
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="font-playfair text-[48px] font-bold text-white mb-6">Step Into the Story</h2>
          <p className="font-montserrat text-[18px] text-white/90 mb-12">
            Discover the full curation of our Nairobi heritage collection. Timeless designs, ethically crafted for the modern visionary.
          </p>
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <Link
              href="/collections/shop"
              className="inline-block bg-white text-[#430562] px-10 py-5 font-montserrat text-[14px] font-semibold uppercase tracking-wider hover:bg-[#f2ecf0] transition-colors"
            >
              Shop the Collection
            </Link>
            <Link
              href="/collections"
              className="inline-block border border-white/50 text-white px-10 py-5 font-montserrat text-[14px] font-semibold uppercase tracking-wider hover:bg-white/10 transition-colors"
            >
              View Lookbook
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
