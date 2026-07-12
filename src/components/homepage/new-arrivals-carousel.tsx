'use client';

import * as React from 'react';
import Link from 'next/link';
import { Heart, ChevronLeft, ChevronRight } from 'lucide-react';

// Stitch section 5: Horizontal scrolling product card rail
// Card: min-w-[320px], image h-[420px], Quick Add overlay on hover

interface ProductCardData {
  id: string;
  name: string;
  price: string; // formatted, e.g. "KES 24,500"
  href: string;
  imageSrc: string;
  imageAlt: string;
}

interface NewArrivalsCarouselProps {
  /** Pass real DB products; falls back to Stitch static data */
  products?: ProductCardData[];
  eyebrow?: string;
  title?: string;
}

const STITCH_PRODUCTS: ProductCardData[] = [
  {
    id: 'lavender-silk',
    name: 'Draped Lavender Silk Dress',
    price: 'KES 24,500',
    href: '/products/draped-lavender-silk-dress',
    imageSrc:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA1N2IK6KrUKSdzXviet3Wl4H_cxyxilERSfmCzGeIFZYpf-vT3f75kgtux4Wmx9KL55_zEdV7toVcQ-tAiBBYf-7w5dgMfqrpi4W2fgP3iQEJbL53IwVB7alEOKDp4M90tPIfN0pppV_fTrq0OFkFHt-gQGkS0Uyz7ZOUqoXrW6MWdypec8b7jEi9Cx0QPwnbiELK9rfQ3BhMQCMCyAttnpPhpD5oO-9KnoyIUudVlEYYrHo_0fjolhueG9ba-Vji4EexDgR7QDQ',
    imageAlt: 'Full-length shot of a hand-draped lavender silk dress with asymmetrical hemline.',
  },
  {
    id: 'orbital-studs',
    name: 'Orbital Gold Sculptural Studs',
    price: 'KES 8,200',
    href: '/products/orbital-gold-sculptural-studs',
    imageSrc:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBRd0tFBhTP24-uopm3fffUEGmY0cJ0TidRH-S__S4snyluqzWkISmKx3IO4ULSUQ4v5TMJ16MfKQ9aXD88BZz6aOgBIF7LI6cvcak4NN0Cr5lQcWcJmAUSzzaslpp7XR9cx7zzgCgU8_JxZQw_Jxj-4K7sRQa2D2q8RiQ2xHmapWDClit4Ig1XmirTTyywYhLUfveQipg70Xw_8ooSD8fhWLmmmcL61v16ZdVkcuQvisNPdo50irWJmL3AjxuW3LZcBRTXtA6A7g',
    imageAlt: 'A pair of statement sculptural gold earrings photographed against a dark plum background.',
  },
  {
    id: 'emerald-blazer',
    name: 'Tailored Emerald Blazer',
    price: 'KES 18,900',
    href: '/products/tailored-emerald-blazer',
    imageSrc:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAVX5TlQJzCGkzvlEFTdVe_878OkWymDeabiBF8PfcR-Oi1k2dbA0BMWgkQOXWRu5PuPNPIXu8xXVlbALdpZ0yOoEc85xE-HI_mHTZkO1DxK4brgT_2_Xt2WblTXhP9ytK1GNMAiNvqe6wxfyTZ0ho64amHgnuX5BjB9LNltYrBwnIfFqzWCtUVmKDnWMmhX6r0r_tuXtW_DpmyOa38mI-0CTG7TUFsnuUeDr16fb6xUgcbvwtQ-xwwHTiwlWIL3JW4P1TzQQRolw',
    imageAlt: 'A structured blazer in deep emerald green wool-blend with sharp editorial silhouette.',
  },
  {
    id: 'heritage-scarf',
    name: 'Heritage Print Silk Scarf',
    price: 'KES 5,500',
    href: '/products/heritage-print-silk-scarf',
    imageSrc:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB7iGLGGNsLV5wv6sETe9Mo1kVaCdxw1iHBJJ-Qf4U7yEFhvQfYzXyFP7STkJd5tME51PwU_6SmeGid9fra_N53XthbThiAhQb9etAiIEaXdoV8-uLdvwoQ0r-pcXJ8yQwV7SsVyofjBRZEMVs3uPINVFok2r1C8miwuyrh3QbfXK8JAnEIWOZ53-U_c2ORhHo7YcnRD9FHC8DcA1EQKMtzqoPeIqqk8sm9rBqHsyleEIlLcrVsrky9akzpp1tpPe9-QRSTWRqvEg',
    imageAlt: 'A luxurious silk scarf with a vibrant geometric African print styled as a headwrap.',
  },
];

function ProductCard({ product }: { product: ProductCardData }) {
  const [wished, setWished] = React.useState(false);

  return (
    <div className="min-w-[320px] snap-start group cursor-pointer">
      <div className="relative h-[420px] overflow-hidden mb-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageSrc}
          alt={product.imageAlt}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />

        {/* Wishlist button */}
        <button
          type="button"
          onClick={() => setWished((p) => !p)}
          aria-label={wished ? 'Remove from wishlist' : 'Save to wishlist'}
          className="absolute top-4 right-4 bg-white/80 p-2 rounded-full hover:bg-white transition-colors"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${wished ? 'fill-[#430562] text-[#430562]' : 'text-[#430562]'}`}
            aria-hidden
          />
        </button>

        {/* Quick Add overlay */}
        <Link
          href={product.href}
          className="absolute bottom-0 left-0 right-0 bg-[#430562] text-white py-4 text-center translate-y-full group-hover:translate-y-0 transition-transform duration-300 font-montserrat text-[14px] font-semibold uppercase tracking-[0.05em]"
        >
          Quick Add
        </Link>
      </div>

      <Link href={product.href} className="block">
        <h4 className="font-montserrat text-[14px] font-semibold leading-[20px] uppercase tracking-[0.05em] text-[#1d1b1e] mb-1">
          {product.name}
        </h4>
        <p className="font-montserrat text-[16px] leading-[24px] text-[#4d444f]">
          {product.price}
        </p>
      </Link>
    </div>
  );
}

export function NewArrivalsCarousel({
  products,
  eyebrow = 'Seasonal Picks',
  title = 'The New Collection',
}: NewArrivalsCarouselProps) {
  const railRef = React.useRef<HTMLDivElement>(null);
  const displayProducts = products ?? STITCH_PRODUCTS;

  const scroll = (dir: 'left' | 'right') => {
    if (!railRef.current) return;
    const amount = 344; // 320px card + 24px gap
    railRef.current.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' });
  };

  return (
    <section className="py-[64px] overflow-hidden bg-[#f8f2f6]" aria-label="New Arrivals">
      {/* Section header */}
      <div className="px-5 sm:px-10 lg:px-[80px] max-w-[1440px] mx-auto mb-8 flex justify-between items-end">
        <div>
          <span className="font-montserrat text-[12px] font-medium leading-[16px] uppercase tracking-[0.12em] text-[#775a1a]">
            {eyebrow}
          </span>
          <h2 className="font-playfair text-[48px] font-semibold leading-[56px] text-[#1d1b1e] mt-2">
            {title}
          </h2>
        </div>

        {/* Prev / Next buttons */}
        <div className="flex gap-4" role="group" aria-label="Carousel navigation">
          <button
            type="button"
            onClick={() => scroll('left')}
            aria-label="Previous products"
            className="w-12 h-12 rounded-full border border-[#7e7480] flex items-center justify-center hover:bg-[#430562] hover:text-white hover:border-[#430562] transition-colors duration-300"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            aria-label="Next products"
            className="w-12 h-12 rounded-full border border-[#7e7480] flex items-center justify-center hover:bg-[#430562] hover:text-white hover:border-[#430562] transition-colors duration-300"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>

      {/* Scrollable rail */}
      <div
        ref={railRef}
        className="flex gap-6 px-5 sm:px-10 lg:px-[80px] overflow-x-auto hide-scrollbar snap-x"
      >
        {displayProducts.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
