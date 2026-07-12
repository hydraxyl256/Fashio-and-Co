// Stitch section 10: Brand Story — centered text, italic serif quote, thin divider
// "Born in Nairobi. Crafted for the World."

interface BrandStoryProps {
  eyebrow?: string;
  quote?: string;
  body?: string;
}

export function BrandStory({
  eyebrow = 'Our Essence',
  quote = '"Born in Nairobi. Crafted for the World."',
  body = "Since 2018, Fashion & Co. has been a pioneer in luxury African fashion. We bridge the gap between ancient textile traditions and modern avant-garde silhouettes. Every piece is an invitation to experience Nairobi's sophistication.",
}: BrandStoryProps) {
  return (
    <section
      className="py-32 bg-[#fef8fc] text-center"
      aria-label="Our brand story"
    >
      <div className="max-w-4xl mx-auto px-5 sm:px-10">
        {/* Eyebrow — gold/secondary, tracking-[0.4em] */}
        <p className="font-montserrat text-[12px] font-medium leading-[16px] uppercase tracking-[0.4em] text-[#775a1a] mb-4">
          {eyebrow}
        </p>

        {/* Quote — italic Playfair Display, headline-lg size */}
        <h2 className="font-playfair text-[clamp(28px,3.5vw,48px)] font-semibold leading-[1.15] italic text-[#1d1b1e] mb-8">
          {quote}
        </h2>

        {/* Thin divider — Stitch: w-16 h-[1px] bg-outline-variant */}
        <div className="w-16 h-px bg-[#cfc2d1] mx-auto mb-8" aria-hidden />

        {/* Body */}
        <p className="font-montserrat text-[18px] leading-[28px] font-normal text-[#4d444f] leading-relaxed px-8 max-w-3xl mx-auto">
          {body}
        </p>
      </div>
    </section>
  );
}
