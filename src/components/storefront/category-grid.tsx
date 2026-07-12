import Link from 'next/link';
import Image from 'next/image';

import { publicImageUrl } from '@/lib/queries/catalogue-types';
import { cn } from '@/lib/utils';

interface CategoryGridItem {
  id: string;
  name: string;
  slug: string;
  imagePath?: string | null;
  count?: number;
  href: string;
}

interface CategoryGridProps {
  items: CategoryGridItem[];
  className?: string;
}

export function CategoryGrid({ items, className }: CategoryGridProps) {
  if (items.length === 0) return null;

  return (
    <div className={cn('grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3', className)}>
      {items.map((item) => {
        const src = item.imagePath ? publicImageUrl(item.imagePath, 'collection-images') : null;
        return (
          <Link
            key={item.id}
            href={item.href}
            className="group relative block aspect-[3/4] overflow-hidden bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {src ? (
              <Image
                src={src}
                alt={item.name}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 ease-elegant group-hover:scale-[1.03]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-bone-100 text-muted-foreground">
                {item.name}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-cocoa/55 via-cocoa/10 to-transparent" aria-hidden />
            <div className="absolute inset-x-4 bottom-4 flex flex-col gap-1 text-bone-50 sm:inset-x-6 sm:bottom-6">
              <p className="eyebrow text-bone-50/80">Shop</p>
              <p className="font-serif text-2xl tracking-tight sm:text-3xl">{item.name}</p>
              {item.count ? (
                <p className="text-xs uppercase tracking-[0.18em] text-bone-50/70">
                  {item.count} pieces
                </p>
              ) : null}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
