import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

import { publicImageUrl } from '@/lib/queries/catalogue-types';
import { cn } from '@/lib/utils';

interface CollectionCardData {
  id: string;
  name: string;
  slug: string;
  subtitle?: string | null;
  description?: string | null;
  heroImagePath?: string | null;
}

interface CollectionFeatureProps {
  collections: CollectionCardData[];
  className?: string;
}

export function CollectionFeature({ collections, className }: CollectionFeatureProps) {
  if (collections.length === 0) return null;
  const [head, ...rest] = collections;

  return (
    <section className={cn('container-prose py-section-sm', className)}>
      <div className="mb-10 flex items-end justify-between">
        <div>
          <p className="eyebrow">Collections</p>
          <h2 className="mt-2 font-serif text-display-lg tracking-tight">A house of edits.</h2>
        </div>
        <Link
          href="/collections"
          className="hidden text-eyebrow uppercase text-foreground transition-colors hover:text-accent sm:inline-flex sm:items-center sm:gap-2"
        >
          All collections <ArrowUpRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      {head ? (
        <Link
          href={`/collections/${head.slug}`}
          className="group relative block aspect-[16/9] overflow-hidden bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {head.heroImagePath ? (
            <Image
              src={publicImageUrl(head.heroImagePath, 'collection-images')}
              alt={head.name}
              fill
              sizes="100vw"
              className="object-cover transition-transform duration-700 ease-elegant group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-bone-100 text-muted-foreground">
              {head.name}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-cocoa/60 via-cocoa/10 to-transparent" aria-hidden />
          <div className="absolute inset-x-6 bottom-6 text-bone-50 sm:inset-x-12 sm:bottom-12">
            <p className="eyebrow text-bone-50/80">Collection</p>
            <h3 className="mt-2 font-serif text-display-lg tracking-tight text-balance">{head.name}</h3>
            {head.subtitle ? (
              <p className="mt-2 text-sm text-bone-50/80">{head.subtitle}</p>
            ) : null}
          </div>
        </Link>
      ) : null}

      {rest.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.slice(0, 3).map((c) => (
            <Link
              key={c.id}
              href={`/collections/${c.slug}`}
              className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                {c.heroImagePath ? (
                  <Image
                    src={publicImageUrl(c.heroImagePath, 'collection-images')}
                    alt={c.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-elegant group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-bone-100 text-muted-foreground">
                    {c.name}
                  </div>
                )}
              </div>
              <div className="mt-4 flex items-baseline justify-between gap-3">
                <div>
                  <p className="font-serif text-lg">{c.name}</p>
                  {c.subtitle ? <p className="text-xs text-muted-foreground">{c.subtitle}</p> : null}
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
              </div>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}
