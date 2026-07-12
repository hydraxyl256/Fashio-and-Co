'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';

// Stitch hero: h-[921px], full-bleed background image, left-aligned copy
// Background image from Stitch: African woman in purple silk gown in Nairobi courtyard
const HERO_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBG4z_FO8VTEAtmLMHOLNqE5KKPd4yb8UKiEUSjEPy6g7dlmPGEyCHONdnYrliCdW2ceBbD7rmIOviJcnfsjFLf2ptCqWAlbR9B_qWoWhPXA11Fe9jxYxaNiVbpRgB2g4p-O9c-bOe-kxcDivG-ECsamPB5NTd555PNHwjbtpMfa1UXIDiN7-nzNslPrjxI7UVG2GgbAYarixZcdrXjw7I4WYsUS00qel7XntbeIbktJCopLGRJWVkHhAT5D5i__Hxa9Mvs_her_g';

interface HeroSectionProps {
  /** Override the background image URL (e.g. from CMS) */
  imageSrc?: string;
  title?: string;
  body?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export function HeroSection({
  imageSrc = HERO_IMAGE,
  title = 'Elevated African Luxury Defined.',
  body = 'Discover our latest collection of hand-draped silks and artisanal jewelry, crafted for the modern visionary.',
  primaryLabel = 'Shop New Collection',
  primaryHref = '/collections/new',
  secondaryLabel = 'Explore Jewelry',
  secondaryHref = '/collections/category/jewelry',
}: HeroSectionProps) {
  const reduced = useReducedMotion();

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ minHeight: '600px', height: 'clamp(600px, 64vw, 921px)' }}
      aria-label="Hero banner"
    >
      {/* Background image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc}
        alt="An editorial high-fashion photograph of a graceful African woman wearing a majestic royal purple silk gown"
        className="absolute inset-0 w-full h-full object-cover object-center"
        // Above-the-fold: eager + high priority
        loading="eager"
        fetchPriority="high"
        decoding="sync"
      />

      {/* Dark overlay — Stitch: bg-black/10 */}
      <div className="absolute inset-0 bg-black/10" aria-hidden />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-center items-start px-5 sm:px-10 lg:px-[80px] max-w-[1440px] mx-auto text-white">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
        >
          {/* Stitch: display-lg, Playfair Display 700, max-w-2xl */}
          <h1 className="font-playfair text-[clamp(40px,5vw,64px)] leading-[1.1] tracking-[-0.02em] font-bold max-w-2xl mb-4 drop-shadow-md">
            {title}
          </h1>

          {/* Stitch: body-lg, Montserrat 400, max-w-lg */}
          <p className="font-montserrat text-[18px] leading-[28px] font-normal max-w-lg mb-8 drop-shadow-sm">
            {body}
          </p>

          {/* CTAs — Stitch: gap-[24px] */}
          <div className="flex flex-wrap gap-6">
            <Link
              href={primaryHref}
              className="bg-[#430562] text-white px-10 py-4 font-montserrat text-[14px] font-semibold leading-[20px] uppercase tracking-[0.12em] hover:bg-[#3d174f] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {primaryLabel}
            </Link>
            <Link
              href={secondaryHref}
              className="border border-white text-white px-10 py-4 font-montserrat text-[14px] font-semibold leading-[20px] uppercase tracking-[0.12em] hover:bg-white/10 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {secondaryLabel}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
