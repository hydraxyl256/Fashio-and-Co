import type { Metadata } from 'next';

import { CollectionResults } from '@/components/storefront/collection-results';
import { listProducts } from '@/lib/queries/catalogue';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'New Arrivals — Fashion & Co.',
  description: 'The latest pieces from our Nairobi atelier. Fresh drops, seasonal edits, limited runs.',
};

export const revalidate = 300;

interface PageProps {
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

export default async function NewArrivalsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const sort =
    (pickFirst(sp.sort) as 'newest' | 'price-asc' | 'price-desc' | 'featured' | undefined) ?? 'newest';
  const page = asInt(pickFirst(sp.page), 1);
  const minPrice = asInt(pickFirst(sp.minPrice), 0) || undefined;
  const maxPrice = asInt(pickFirst(sp.maxPrice), 0) || undefined;

  const result = await listProducts({
    sort,
    page,
    size: pickFirst(sp.size),
    color: pickFirst(sp.color),
    minPriceCents: minPrice ? minPrice * 100 : undefined,
    maxPriceCents: maxPrice ? maxPrice * 100 : undefined,
    inStockOnly: pickFirst(sp.inStock) === '1',
    pageSize: 12,
  });

  return (
    <div>
      {/* Page Header */}
      <section className="container-prose pt-20 pb-12 lg:pt-28">
        <Badge variant="outline" className="mb-4">New Arrivals</Badge>
        <h1 className="mt-3 font-serif text-display-xl tracking-tight text-balance max-w-3xl">
          Just landed.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground leading-relaxed">
          The latest pieces from our Nairobi atelier — fresh drops, seasonal edits, and limited runs.
          Each piece is produced in small quantities.
        </p>
      </section>

      {/* Product Grid */}
      <section className="container-prose py-section-sm">
        <CollectionResults result={result} pageSize={12} />
      </section>
    </div>
  );
}
