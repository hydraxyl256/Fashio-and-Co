import Link from 'next/link';
import Image from 'next/image';

import { publicImageUrl } from '@/lib/queries/catalogue-types';

interface StorySectionProps {
  title?: string;
  body?: string;
  imagePath?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export function StorySection({
  title = 'A Nairobi atelier, since 2018.',
  body = 'We make slowly, in small runs, from linen grown in the Rift Valley and brass cast in our Industrial Area workshop. Every piece passes through two pairs of hands before it is signed and packed.',
  imagePath = 'campaign-images/atelier-portrait.jpg',
  ctaLabel = 'Read our story',
  ctaHref = '/about',
}: StorySectionProps) {
  const imageUrl = publicImageUrl(imagePath, 'campaign-images');
  return (
    <section className="bg-cocoa py-section text-bone-50">
      <div className="container-prose grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="eyebrow text-bone-50/70">Our story</p>
          <h2 className="mt-3 font-serif text-display-lg tracking-tight text-balance">{title}</h2>
          <p className="mt-4 text-base text-bone-50/80 leading-relaxed text-pretty">{body}</p>
          <Link
            href={ctaHref}
            className="mt-8 inline-flex items-center gap-2 text-eyebrow uppercase tracking-[0.2em] text-bone-50 transition-colors hover:text-accent"
          >
            {ctaLabel} →
          </Link>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden bg-cocoa-50">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-cocoa-50 font-serif text-sm uppercase tracking-[0.18em] text-bone-50/60">
              Atelier portrait
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
