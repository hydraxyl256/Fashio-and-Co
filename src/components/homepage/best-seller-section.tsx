import Link from 'next/link';
import { Heart } from 'lucide-react';

// Stitch section 8: Best Sellers — 4-col product grid
// Centered header with gold underline divider (w-20 h-1 bg-[#775a1a])

interface BestSellerProduct {
  id: string;
  name: string;
  price: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
}

interface BestSellerSectionProps {
  products?: BestSellerProduct[];
  title?: string;
}

const STITCH_BEST_SELLERS: BestSellerProduct[] = [
  {
    id: 'white-silk-shirt',
    name: 'Essential White Silk Shirt',
    price: 'KES 11,000',
    href: '/products/essential-white-silk-shirt',
    imageSrc:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAP_WiLZ9JAg5PUCPJLW_qhJtf19U-KbfMLvbVhCOJ5_Ym6pCas69yX_yQPqUQ60aDoUkCuwooTbSw8tuQLDeGNZugZntqfH4PiW663kaX0omW_UyCwRRpNd5i1kolhtDgLl-odGhyNYezh3e7oelBMwiQ-6qhOixDfSuX-Mambiw-oBpMOvH-TgOMbizsNqkZl-F5ebxNcDmlIAEbPfn7KzzahXziTgKUbHX1Fx4GeykWvbgSEc8vLCWUWoTysWeFgPiobW2XA0Q',
    imageAlt: 'A minimalist white silk shirt with exaggerated cuffs styled with clean-cut trousers.',
  },
  {
    id: 'heritage-bracelet',
    name: 'Heritage Link Bracelet',
    price: 'KES 6,800',
    href: '/products/heritage-link-bracelet',
    imageSrc:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBttrpudVGkypXh0qSkL3nCn37vlWBOMXg9u6VZE4A4eQ8EQVPPfQ7_HDT1HV4SByUy4LzzxyibIEozACZ8XPK-Hx-MYAz1J_nu66_NbGNVqSFckCZAy0sbauW_E1vWUiwfXKP0r_9NISULt7ftNyYjGSEx13pQVP3HLDqPHkpLEfm3363Nrd42lx7C2lRixdn2U_Q49hodOclvzG0IgbMqUV7V8EO-FAyhbe0JJDyejmcyQXmL-g4Hv9ZcekTzyoIhr-4JrrLlFw',
    imageAlt: 'Fine 18k gold link bracelet featuring a small lion-head charm.',
  },
  {
    id: 'midnight-midi',
    name: 'Midnight Pleated Midi',
    price: 'KES 14,500',
    href: '/products/midnight-pleated-midi',
    imageSrc:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAgVrvoAY6-G-U-pkh-83qv7FcxCCPJuakW6-4tALaliBgpRz6KxL3V4u0j4dnIn_8mzJBq5oeO3ZQSYrOC9NRXPmRjzkUorhIXOWKqeatsFnshFfYzidcfmIroLp6jmW81VeonVkMXrwtgIOys8QHIv-OrQr29rJt9q-gpmhMYjwWaIu4K7k99JP74mHOB9nN_wVH9XhIS6WHGQfAK6gh_XDa-I1VA5mmP1pSvzO9gqyy-G3hvD9eWznm5fqbqjTMMwB9VngMsNQ',
    imageAlt: 'A deep navy wool midi skirt with a structured waist and soft pleats.',
  },
  {
    id: 'stone-ring',
    name: 'Raw Stone Signature Ring',
    price: 'KES 9,200',
    href: '/products/raw-stone-signature-ring',
    imageSrc:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAozysmZhpVwoY4yYrmU6nqZBwD7qbXoSwlSFUV9a2NcmmnQtxuB6qbxi-Bb9xpvvFi-IgIN9qscglRGr3f63BwypmGCjeBnFVrAELIPb0yykyGsStpCJzkYTwF40FIHSHpYpQ2DTOrGyyA98KgZyvydJYymO6NbTxp7OV1ZamIrHi8BlYsfaxB1sUNNDpdRUJM2TnurwgZz3Z5UTc0FKy17lVntiHG4tUEFztIDEJb9nPpqnjYSY04Rzdp-DZu21Wvyvhjac6nrA',
    imageAlt: 'Statement gold ring with an embedded uncut semi-precious stone.',
  },
];

export function BestSellerSection({
  products,
  title = 'The Best Sellers',
}: BestSellerSectionProps) {
  const displayProducts = products ?? STITCH_BEST_SELLERS;

  return (
    <section
      className="py-[64px] stitch-container-mobile max-w-[1440px] mx-auto bg-white"
      aria-label="Best Sellers"
    >
      {/* Centered header + gold divider */}
      <div className="text-center mb-[64px]">
        <h2 className="font-playfair text-[48px] font-semibold leading-[56px] text-[#1d1b1e]">
          {title}
        </h2>
        <div className="w-20 h-1 bg-[#775a1a] mx-auto mt-4" aria-hidden />
      </div>

      {/* 4-col product grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {displayProducts.map((product) => (
          <div key={product.id} className="space-y-4">
            <Link href={product.href} className="block overflow-hidden group" aria-label={product.name}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.imageSrc}
                alt={product.imageAlt}
                className="w-full aspect-[3/4] object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
            </Link>

            <div className="flex justify-between items-start">
              <div>
                <Link href={product.href}>
                  <h4 className="font-montserrat text-[14px] font-semibold leading-[20px] uppercase tracking-[0.05em] text-[#1d1b1e] hover:text-[#430562] transition-colors">
                    {product.name}
                  </h4>
                </Link>
                <p className="font-montserrat text-[16px] leading-[24px] text-[#4d444f] mt-1">
                  {product.price}
                </p>
              </div>
              <button
                type="button"
                aria-label={`Save ${product.name} to wishlist`}
                className="text-[#4d444f] hover:text-[#430562] transition-colors"
              >
                <Heart className="h-5 w-5" aria-hidden />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
