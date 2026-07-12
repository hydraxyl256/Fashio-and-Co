import { ProductCard } from '@/components/storefront/product-card';
import { EmptyState } from '@/components/ui/empty-state';
import type { ProductCardData } from '@/lib/queries/catalogue-types';

interface ProductGridProps {
  products: ProductCardData[];
  emptyTitle?: string;
  emptyDescription?: string;
}

export function ProductGrid({
  products,
  emptyTitle = 'Nothing in this edit yet',
  emptyDescription = 'We are preparing the next collection. Please return shortly.',
}: ProductGridProps) {
  if (products.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-2 md:gap-x-8 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
