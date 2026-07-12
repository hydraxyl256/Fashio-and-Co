import Link from 'next/link';

// Stitch section 9: Jewelry Spotlight
// Left: framed image (p-12, border border-secondary/20) + decorative offset box
// Right: eyebrow, display-lg title, body, CTA button

const JEWELRY_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCE4Me-1nkC5sCGxTDjbHTeWlstwkgsX7pHEw3IN4bBwEKo0MrJz8_35cmjJkYQUFGzBUdIr2f1yCrLcwUGHTLaTEX0g2MraqHZdUui0DL-ORiTkiT9NJtwnOUDHbhsJlo5Jlv4JJenjJrrtAjBXNjZbJ-pKzxcGr1Pa9ejYFjp7dyyIWezay8pacjYCweibGgF0OR8OFCyXfLaFlMju_jWklHCs6YsAldrnLfi2pcf27OtAjMvIiaa6h-pAoDdBfwZdl1cQyW9-A';

interface JewelryHighlightProps {
  eyebrow?: string;
  title?: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  imageSrc?: string;
  imageAlt?: string;
}

export function JewelryHighlight({
  eyebrow = 'The Jewelry Atelier',
  title = 'Sculpted Light & Gold.',
  body = "Inspired by the architectural forms of Nairobi and the organic movements of the savannah, our jewelry collection is a tribute to the enduring brilliance of hand-forged 18k gold.",
  ctaLabel = 'Explore the Atelier',
  ctaHref = '/collections/category/jewelry',
  imageSrc = JEWELRY_IMAGE,
  imageAlt = "A hyper-detailed close-up of a model's ear wearing a cascade of thin gold hoops and architectural studs.",
}: JewelryHighlightProps) {
  return (
    <section
      className="py-[64px] bg-[#fef8fc]"
      aria-label="Jewelry Atelier"
    >
      <div className="px-5 sm:px-10 lg:px-[80px] max-w-[1440px] mx-auto flex flex-col md:flex-row items-center gap-[64px]">
        {/* Left: framed image with decorative offset box */}
        <div className="w-full md:w-1/2">
          <div className="relative p-12 border border-[#775a1a]/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt={imageAlt}
              className="w-full h-auto"
              loading="lazy"
              decoding="async"
            />
            {/* Decorative offset box — Stitch: absolute -bottom-8 -right-8 */}
            <div
              className="absolute -bottom-8 -right-8 w-48 h-48 border-4 border-[#775a1a]/30 -z-10"
              aria-hidden
            />
          </div>
        </div>

        {/* Right: copy */}
        <div className="w-full md:w-1/2 space-y-8">
          {/* Eyebrow — gold/secondary colour, tracking-[0.3em] */}
          <span className="font-montserrat text-[14px] font-semibold leading-[20px] uppercase tracking-[0.3em] text-[#775a1a]">
            {eyebrow}
          </span>

          {/* Title — display-lg, Playfair Display, text-[#430562] */}
          <h2 className="font-playfair text-[clamp(36px,4vw,64px)] leading-[1.1] tracking-[-0.02em] font-bold text-[#430562]">
            {title}
          </h2>

          {/* Body */}
          <p className="font-montserrat text-[18px] leading-[28px] font-normal text-[#4d444f]">
            {body}
          </p>

          {/* CTA — bg-[#430562] hover:bg-[#775a1a] */}
          <Link
            href={ctaHref}
            className="inline-block bg-[#430562] text-white px-10 py-4 font-montserrat text-[14px] font-semibold uppercase tracking-[0.12em] hover:bg-[#775a1a] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#430562] focus-visible:ring-offset-2"
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
