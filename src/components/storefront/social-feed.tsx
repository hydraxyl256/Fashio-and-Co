import Link from 'next/link';
import Image from 'next/image';
import { Instagram } from 'lucide-react';

import { publicImageUrl } from '@/lib/queries/catalogue-types';
import { cn } from '@/lib/utils';

interface SocialItem {
  imagePath: string;
  alt: string;
  href: string;
}

interface SocialFeedProps {
  items?: SocialItem[];
  handle?: string;
  className?: string;
}

const DEFAULT_ITEMS: SocialItem[] = Array.from({ length: 6 }).map((_, i) => ({
  imagePath: `campaign-images/lookbook-${String(i + 1).padStart(2, '0')}.jpg`,
  alt: `Lookbook piece ${i + 1}`,
  href: 'https://instagram.com',
}));

export function SocialFeed({
  items = DEFAULT_ITEMS,
  handle = '@fashionandco',
  className,
}: SocialFeedProps) {
  return (
    <section className={cn('py-section-sm', className)}>
      <div className="container-prose">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Follow</p>
            <h2 className="mt-2 font-serif text-display-lg tracking-tight">
              <Link href="https://instagram.com" className="link-elegant inline-flex items-center gap-3">
                <Instagram className="h-6 w-6" aria-hidden /> {handle}
              </Link>
            </h2>
          </div>
          <p className="hidden text-sm text-muted-foreground sm:block">
            Behind-the-atelier moments, hand-finished pieces, and campaign film.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {items.map((item, idx) => {
            const src = publicImageUrl(item.imagePath, 'campaign-images');
            return (
              <Link
                key={idx}
                href={item.href}
                target="_blank"
                rel="noreferrer noopener"
                className="group relative block aspect-square overflow-hidden bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label={`View on Instagram — ${item.alt}`}
              >
                {src ? (
                  <Image
                    src={src}
                    alt={item.alt}
                    fill
                    sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw"
                    className="object-cover transition-transform duration-700 ease-elegant group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-bone-100 text-muted-foreground">
                    <Instagram className="h-6 w-6" aria-hidden />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
