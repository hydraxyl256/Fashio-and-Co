import Link from 'next/link';

// Stitch section 6: Full-viewport editorial split
// Left: bg-[#3d174f] (tertiary), right: image with hover scale-110
// Title: "The Art of Detail." — display-lg, Playfair Display

const EDITORIAL_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAvPPU8JY6vwahLt9WcKF9IBKEq4yvrTwU8zJfFLtHKNGuN8HIqlUMJTFUWgKs_RfwBtWyEAl8rXPdVjJw6V--AOnW8X2FWHkOkLxO97p2nfwtGBtYt_st_Gmx10VnZ6hIljx4d-T0K0nsZA3_rqsilhxK4wyqFeO0cGpDKuJhZ_fy1JhZOzs7Cyl6HOqaHcJX_aaP3AgcxC6iOsArcTidhns9943g66zOWDctiP1JAZY41i1Z872FFjQljhqrYSuUfyA_Bzpmmbg';

interface EditorialBannerProps {
  eyebrow?: string;
  title?: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  imageSrc?: string;
  imageAlt?: string;
}

export function EditorialBanner({
  eyebrow = 'The Philosophy',
  title = 'The Art of Detail.',
  body = "Crafted for the modern woman who values heritage and contemporary style. Our pieces are more than garments; they are narratives of Nairobi's creative soul.",
  ctaLabel = 'Read Our Story',
  ctaHref = '/about',
  imageSrc = EDITORIAL_IMAGE,
  imageAlt = "A hyper-detailed close-up of a tailor's hand precisely stitching a silk collar.",
}: EditorialBannerProps) {
  return (
    <section
      className="flex flex-col md:flex-row"
      style={{ minHeight: '100svh' }}
      aria-label="Editorial — The Art of Detail"
    >
      {/* Left text panel — bg-[#3d174f] (Stitch tertiary) */}
      <div className="w-full md:w-1/2 bg-[#3d174f] flex items-center justify-center p-[80px] max-md:p-10">
        <div className="max-w-md text-white">
          {/* Eyebrow — on-tertiary-container colour */}
          <span className="font-montserrat text-[12px] font-medium leading-[16px] uppercase tracking-[0.12em] text-[#c799da] mb-4 block">
            {eyebrow}
          </span>

          {/* Title — display-lg, Playfair Display */}
          <h2 className="font-playfair text-[clamp(40px,4.5vw,64px)] leading-[1.1] tracking-[-0.02em] font-bold mb-8">
            {title}
          </h2>

          {/* Body */}
          <p className="font-montserrat text-[18px] leading-[28px] font-normal mb-8 opacity-90">
            {body}
          </p>

          {/* CTA link */}
          <Link
            href={ctaHref}
            className="inline-block border-b-2 border-[#c799da] pb-1 font-montserrat text-[14px] font-semibold uppercase tracking-[0.12em] text-white hover:text-[#c799da] transition-colors duration-300"
          >
            {ctaLabel}
          </Link>
        </div>
      </div>

      {/* Right image panel */}
      <div className="w-full md:w-1/2 overflow-hidden min-h-[400px] md:min-h-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={imageAlt}
          className="w-full h-full object-cover object-center transition-transform duration-1000 hover:scale-110"
          style={{ minHeight: '400px' }}
          loading="lazy"
          decoding="async"
        />
      </div>
    </section>
  );
}
