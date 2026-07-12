import type { Metadata } from 'next';

import { CollectionResults } from '@/components/storefront/collection-results';
import { getCategoryBySlug, listProducts } from '@/lib/queries/catalogue';
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

/** Turn a slug like "womenswear" into "Womenswear" for fallback display */
function slugToTitle(slug: string) {
  return slug
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** Local shape — avoids 'never' when Supabase types lag behind the schema */
type CategoryRow = {
  name: string;
  description: string | null;
} | null;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug) as unknown as CategoryRow;
  const name = category?.name ?? slugToTitle(slug);
  return {
    title: name,
    description: category?.description ?? `Shop ${name}.`,
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  // If the category doesn't exist in the DB yet, we still render the page
  // with an empty product grid rather than 404-ing.
  const category = await getCategoryBySlug(slug) as unknown as CategoryRow;

  const sort =
    (pickFirst(sp.sort) as 'newest' | 'price-asc' | 'price-desc' | 'featured' | undefined) ?? 'newest';
  const page = asInt(pickFirst(sp.page), 1);
  const minPrice = asInt(pickFirst(sp.minPrice), 0) || undefined;
  const maxPrice = asInt(pickFirst(sp.maxPrice), 0) || undefined;

  const result = await listProducts({
    categorySlug: slug,
    sort,
    page,
    size: pickFirst(sp.size),
    color: pickFirst(sp.color),
    minPriceCents: minPrice ? minPrice * 100 : undefined,
    maxPriceCents: maxPrice ? maxPrice * 100 : undefined,
    inStockOnly: pickFirst(sp.inStock) === '1',
    pageSize: 12,
  });

  const displayName = category?.name ?? slugToTitle(slug);
  const displayDescription = category?.description ?? null;

  return (
    <div>
      <section className="container-prose pt-20 pb-12 lg:pt-24">
        <Badge variant="outline" className="mb-4">
          Category
        </Badge>
        <h1 className="font-serif text-display-xl tracking-tight text-balance max-w-3xl">{displayName}</h1>
        {displayDescription ? (
          <p className="mt-3 max-w-2xl text-base text-muted-foreground leading-relaxed">
            {displayDescription}
          </p>
        ) : null}
      </section>

      <section className="container-prose py-section-sm">
        <CollectionResults result={result} pageSize={12} />
      </section>
    </div>
  );
}
