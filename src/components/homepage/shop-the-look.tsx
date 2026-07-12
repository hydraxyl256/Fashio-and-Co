'use client';

import * as React from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

// Stitch section 7: Shop the Look
// Left: 3/5 wide editorial image with 2 animated hotspot dots
// Right: 2/5 product list + "Add Set to Bag" CTA

const LOOK_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAN4pULJdliRWVITYjhic-KgRPO9A1KVG-yECupwHOo7gT2zmr1-9B5ZQkH6iNdmVUN7fZEfMDhPyR4w4hC4KhcxH8LRGytIz_QCWcnhphQlxs_qE3S835zRVuozzv2i49zK0jfshyTShqnnHpuPXCK_IrFm_4stTELMhLyEmuu7tfWWsjL2aVItmairsuy9m1NMe7Lqx10KNa9gK8pkH3ErhM7LQTnG3Fcic0HPkSWrDoSG9KjDRM7kHa9hOWaFSetIMdNTN_-6g';

interface LookItem {
  id: string;
  name: string;
  price: string;
  totalCents?: number;
  href: string;
  imageSrc: string;
  imageAlt: string;
}

interface ShopTheLookProps {
  items?: LookItem[];
  bagLabel?: string;
  totalLabel?: string;
}

const DEFAULT_ITEMS: LookItem[] = [
  {
    id: 'terracotta-gown',
    name: 'Terracotta Silk Gown',
    price: 'KES 32,000',
    href: '/products/terracotta-silk-gown',
    imageSrc:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuALmgXY7mTLzHLPv1NXg36Z0-pjlzAWQ5Qer4WPIL_L7VKLH1D9I87GfnqPrW3dd6s19CwbcDrf-S7EoKcTDS-z5FyErqhwBNWtPdBKRe_0mo7NX3y9kdLPH8_SGHLFN50O9DztP5OY-QbLIeSFVv0v1peC23efOQh4RhrLSG4SNdmgV8r14JwFt4ynS6X2SazcMx3vpErCr8lZcdjOisihDKAimP47e6oaW4gkS0MCcuMI-fEERaLhZtvVckea2wqFEskaTD3isg',
    imageAlt: 'Close-up of terracotta silk dress fabric with soft sheen.',
  },
  {
    id: 'gold-choker',
    name: 'Geometric Gold Choker',
    price: 'KES 12,500',
    href: '/products/geometric-gold-choker',
    imageSrc:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDhbcVtkEd7wXS75zxNlPYChaeQ44ad5fsHBxBKqNQseD7yFGrfHurmJ7mOz42fLhArTauBdnXh9wdVB9aAB950x80uz9mtUo3ulfEEg5jMD-aZJ9ko-guhMw6ig3sKFF1iI3JsnzDPouK_8WEquvGN2LOQ3Y6Ty4u8q1SQm4h78kD4U1aQUqu8PrSzRif40hEXSG9nRSnUpEwwbK42jC1bmssP5b2Uc9DmpvYgggVm8P7mIUgBn5jpTkVrSO1_cIELhyV-cxrFkg',
    imageAlt: 'Bold geometric gold choker necklace on a white pedestal.',
  },
];

export function ShopTheLook({
  items = DEFAULT_ITEMS,
  bagLabel = 'Add Set to Bag',
  totalLabel = 'KES 44,500',
}: ShopTheLookProps) {
  const [adding, setAdding] = React.useState(false);

  const handleAddSet = () => {
    setAdding(true);
    setTimeout(() => setAdding(false), 1200);
  };

  return (
    <section
      className="py-[64px] stitch-container-mobile max-w-[1440px] mx-auto"
      aria-label="Shop the Look"
    >
      <div className="flex flex-col lg:flex-row gap-[64px] items-center">
        {/* Left: editorial image 3/5 with hotspot dots */}
        <div className="w-full lg:w-3/5 relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LOOK_IMAGE}
            alt="A striking full-body shot of a model wearing a floor-length terracotta silk dress paired with a geometric gold choker"
            className="w-full h-[700px] object-cover object-top"
            loading="lazy"
            decoding="async"
          />
          {/* Hotspot 1 — choker area */}
          <div
            className="absolute top-1/4 right-[20%] w-6 h-6 bg-white/90 rounded-full cursor-pointer flex items-center justify-center animate-pulse"
            aria-label="View Geometric Gold Choker"
            role="button"
            tabIndex={0}
          >
            <span className="w-2 h-2 bg-[#430562] rounded-full" aria-hidden />
          </div>
          {/* Hotspot 2 — dress area */}
          <div
            className="absolute bottom-1/3 left-[40%] w-6 h-6 bg-white/90 rounded-full cursor-pointer flex items-center justify-center animate-pulse"
            aria-label="View Terracotta Silk Gown"
            role="button"
            tabIndex={0}
          >
            <span className="w-2 h-2 bg-[#430562] rounded-full" aria-hidden />
          </div>
        </div>

        {/* Right: product list 2/5 */}
        <div className="w-full lg:w-2/5 space-y-8">
          <h2 className="font-playfair text-[48px] font-semibold leading-[56px] text-[#1d1b1e]">
            Shop the Look
          </h2>

          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 items-center group cursor-pointer border-b border-[#cfc2d1]/30 pb-4"
              >
                {/* Thumbnail */}
                <div className="w-20 h-20 bg-[#f2ecf0] overflow-hidden flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageSrc}
                    alt={item.imageAlt}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                {/* Name + price */}
                <div className="flex-1">
                  <h4 className="font-montserrat text-[14px] font-semibold leading-[20px] uppercase tracking-[0.05em] text-[#1d1b1e]">
                    {item.name}
                  </h4>
                  <p className="font-montserrat text-[16px] leading-[24px] text-[#4d444f] mt-0.5">
                    {item.price}
                  </p>
                </div>

                {/* Bag icon */}
                <Link href={item.href} aria-label={`Add ${item.name} to bag`}>
                  <ShoppingBag className="h-5 w-5 text-[#7e7480] group-hover:text-[#430562] transition-colors duration-300" aria-hidden />
                </Link>
              </div>
            ))}
          </div>

          {/* Add Set to Bag CTA */}
          <button
            type="button"
            onClick={handleAddSet}
            disabled={adding}
            className="w-full bg-[#430562] text-white py-4 font-montserrat text-[14px] font-semibold uppercase tracking-[0.12em] hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {adding ? 'Adding…' : `${bagLabel} — ${totalLabel}`}
          </button>
        </div>
      </div>
    </section>
  );
}
