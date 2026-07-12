import Link from 'next/link';

// Stitch section 4: Asymmetric 4-col collection tile grid, h-[600px]
// Grid: [col-span-2 New Arrivals] | [col-span-1 Occasion Wear] | [col-span-1 stacked: Everyday + Jewelry]

interface CollectionTile {
  title: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  showShopNow?: boolean;
}

const TILES: CollectionTile[] = [
  {
    title: 'New Arrivals',
    href: '/collections/new',
    imageSrc:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDrjoCz7x2CKUwTwP7pcdbCEnGQDSytwqpAprAxN9U7W5ZFEGnVORgZ4-qJZcbzJZMiK96iuVot0wVHtEdNTnOC_8oRcZBpFJEkmqcxyO94-eCWEAOrWfq_8bZacKtGkGrgRXja9nEB8_IokILGPfdwDtNcihf54pqobCBNUimevNdN7oDDVPbTcgTef2qf6vlzvT5wjcwIU3mqmIMSKwx9VbMDt3jGKooNRi5tkb5kE1I0QQJMcqUtyjyTrW8EBwSG9DBMYUeAUA',
    imageAlt:
      'A sophisticated close-up of a high-fashion model wearing a structured architectural coat against a minimalist beige wall.',
    showShopNow: true,
  },
  {
    title: 'Occasion Wear',
    href: '/collections/category/womenswear',
    imageSrc:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAY-u6wxoZtlPRyVL7P_ppq9x53DF76HMbGXzBaqdcMEnSyQrmcDova2ropeNLDeAvO-lAc9CWcDTyOlDoqDmyI5b1-Yh8xhhsnHsJeaqLHrE6yV-7BS9-CXq2T4rVOWxOZUX1iak7rYlG-pYoNgbFPUEEzwNvJb8bGMTqv3MmNBiKKbwtDYjQD-N4_b7dTLW1cssH781ZEfaxlZW-BwY8Xvdv3_LcIY-xgq4RlRygmzg_vfKVB1qn0d-m5HiDs4tnqHR1i6rxgBA',
    imageAlt:
      'A woman in an elegant evening gown of deep plum silk in a dimly lit high-end Nairobi lounge.',
    showShopNow: false,
  },
];

const STACKED_TILES: CollectionTile[] = [
  {
    title: 'Everyday Essentials',
    href: '/collections/category/womenswear',
    imageSrc:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBJcWgzcZmig12eNUaul2K_jrq7zBCJBApNAWJr_EGJv93MpLIL_CYnEyyz9r3yzcig5D7CQZypUCh5-9FDslqn7ESiZy-4v2_9RoXCcXbAX_fBoZMBr-1_IGFO0E3uzWH7H1sDG2NsWRNHUfivG7BPjepo-ZTpoGQriLzanAN73p5lFlTiEm95eAkCY0uAFxmv4FhCqOPEOMRRwDJCbI1y--PgZB0KZ1nNC8hoOQo8O5hIvR6AnFZKJF29Knr-xxFFT0SmQY40qg',
    imageAlt:
      'High-quality lifestyle image of everyday silk essentials in soft champagne and mocha tones.',
    showShopNow: false,
  },
  {
    title: 'Jewelry Edit',
    href: '/collections/category/jewelry',
    imageSrc:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuACMOs2ExZAL-U8wmlfWn14izEOTBZOu5rihQxXgqrrtYrQYWuicsQkonWhWIJ5dI55PBrpWlii4Twav8wZTZxXVex7_Yoq26HUmXFgqxBZC1dkNb2CIn2C2C14Ic5YDE7tizRPWW27pUjrVnW7fbfR_QdTHMa_JO3fkP3UI8jolubBwZ344y-4PMWeapgaiTafk3yzvuE0wGHmL-5rW0XS0xMvmnZE5PLUm3bM5HOpobIGq-cjY_N-m9O049Vr71Zmxrf0eFG2TQ',
    imageAlt:
      'A close-up artistic shot of hand-crafted 18k gold earrings with African-inspired motifs on dark velvet.',
    showShopNow: false,
  },
];

export function FeaturedCollections() {
  return (
    <section className="py-[64px] stitch-container-mobile">
      <div className="max-w-[1440px] mx-auto">
        {/* Stitch grid: 4 cols, h-[600px]. md:grid-cols-4, gap-[24px] */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:h-[600px]">
          {/* Tile 1: New Arrivals — spans 2 cols */}
          <Link
            href={TILES[0]!.href}
            className="md:col-span-2 relative group cursor-pointer overflow-hidden h-[300px] md:h-full block"
            aria-label={`Shop ${TILES[0]!.title}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={TILES[0]!.imageSrc}
              alt={TILES[0]!.imageAlt}
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" aria-hidden />
            <div className="absolute bottom-8 left-8">
              <h3 className="font-playfair text-[24px] font-semibold leading-[32px] text-white mb-2">
                {TILES[0]!.title}
              </h3>
              <span className="text-white border-b border-white pb-1 font-montserrat text-[12px] font-medium uppercase tracking-[0.12em]">
                Shop Now
              </span>
            </div>
          </Link>

          {/* Tile 2: Occasion Wear — 1 col */}
          <Link
            href={TILES[1]!.href}
            className="relative group cursor-pointer overflow-hidden h-[300px] md:h-full block"
            aria-label={`Shop ${TILES[1]!.title}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={TILES[1]!.imageSrc}
              alt={TILES[1]!.imageAlt}
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" aria-hidden />
            <div className="absolute bottom-8 left-8">
              <h3 className="font-playfair text-[24px] font-semibold leading-[32px] text-white">
                {TILES[1]!.title}
              </h3>
            </div>
          </Link>

          {/* Stacked tiles column — 1 col with 2 half-height tiles */}
          <div className="flex flex-col gap-6 md:h-full">
            {STACKED_TILES.map((tile) => (
              <Link
                key={tile.title}
                href={tile.href}
                className="relative flex-1 group cursor-pointer overflow-hidden h-[200px] md:h-full block"
                aria-label={`Shop ${tile.title}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tile.imageSrc}
                  alt={tile.imageAlt}
                  className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-black/10" aria-hidden />
                <div className="absolute bottom-4 left-6">
                  <h3 className="font-playfair text-[24px] font-semibold leading-[32px] text-white">
                    {tile.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
