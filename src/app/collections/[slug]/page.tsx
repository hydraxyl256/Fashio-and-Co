import type { Metadata } from 'next';

import { CollectionResults } from '@/components/storefront/collection-results';
import { listProducts, getCollectionBySlug } from '@/lib/queries/catalogue';
import { publicImageUrl } from '@/lib/queries/catalogue';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function asInt(value: string | string[] | undefined, fallback: number): number {
  if (typeof value !== 'string') return fallback;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function pickFirst(value: string | string[] | undefined): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}

/** Turn a slug like "summer-edit" into "Summer Edit" for fallback display */
function slugToTitle(slug: string) {
  return slug
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** Local shape — avoids 'never' when Supabase types lag behind the schema */
type CollectionRow = {
  name: string;
  description: string | null;
  subtitle: string | null;
  hero_image_url: string | null;
} | null;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug) as unknown as CollectionRow;
  const name = collection?.name ?? slugToTitle(slug);
  return {
    title: name,
    description: collection?.description ?? `The ${name} collection.`,
    openGraph: {
      title: `${name} — Fashion & Co.`,
      description: collection?.description ?? undefined,
      images: collection?.hero_image_url
        ? [{ url: publicImageUrl(collection.hero_image_url, 'collection-images') }]
        : undefined,
    },
  };
}

export default async function CollectionPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  // If the collection doesn't exist in the DB yet we still render an empty
  // product grid rather than 404-ing.
  const collection = await getCollectionBySlug(slug) as unknown as CollectionRow;

  const sort = (pickFirst(sp.sort) as 'newest' | 'price-asc' | 'price-desc' | 'featured' | undefined) ?? 'newest';
  const page = asInt(pickFirst(sp.page), 1);
  const sizeParam = pickFirst(sp.size)?.split(',').filter(Boolean);
  const colorParam = pickFirst(sp.color)?.split(',').filter(Boolean);
  const minPrice = asInt(pickFirst(sp.minPrice), 0) || undefined;
  const maxPrice = asInt(pickFirst(sp.maxPrice), 0) || undefined;

  const result = await listProducts({
    collectionSlug: slug,
    sort,
    page,
    size: sizeParam?.[0],
    color: colorParam?.[0],
    minPriceCents: minPrice ? minPrice * 100 : undefined,
    maxPriceCents: maxPrice ? maxPrice * 100 : undefined,
    inStockOnly: pickFirst(sp.inStock) === '1',
    pageSize: 12,
  });

  const heroImage = collection?.hero_image_url
    ? publicImageUrl(collection.hero_image_url, 'collection-images')
    : null;

  const displayName = collection?.name ?? slugToTitle(slug);
  const displayDescription = collection?.description ?? null;
  const displaySubtitle = collection?.subtitle ?? 'Collection';

  return (
    <div>
      <section className="relative overflow-hidden bg-bone-100">
        {heroImage ? (
          <div className="relative h-[44vh] min-h-[320px] w-full">
            <Image
              src={heroImage}
              alt={displayName}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-cocoa/55 via-cocoa/10 to-transparent" aria-hidden />
          </div>
        ) : null}
        <div className="container-prose relative -mt-20 pb-16 sm:-mt-24">
          <div className="max-w-2xl rounded-md border border-border bg-card/95 p-8 backdrop-blur-sm sm:p-12">
            <Badge variant="brass" className="mb-4">
              {displaySubtitle}
            </Badge>
            <h1 className="font-serif text-display-xl tracking-tight text-balance">{displayName}</h1>
            {displayDescription ? (
              <p className="mt-3 text-base text-muted-foreground leading-relaxed text-pretty">
                {displayDescription}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="container-prose py-section-sm">
        <CollectionResults result={result} pageSize={12} />
      </section>
    </div>
  );
}
