import { FilterSidebar, FilterMobileSheet } from '@/components/storefront/product-filters';
import { SortSelect } from '@/components/storefront/sort-select';
import { LoadMoreGrid } from '@/components/storefront/load-more-grid';
import { listProducts } from '@/lib/queries/catalogue';
import type { ProductListResult } from '@/lib/queries/catalogue-types';
import { ProductGrid } from '@/components/storefront/product-grid';
import { Pagination } from '@/components/storefront/pagination';

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Featured', value: 'featured' },
  { label: 'Price: Low', value: 'price-asc' },
  { label: 'Price: High', value: 'price-desc' },
];

interface CollectionResultsProps {
  result: ProductListResult;
  pageSize: number;
  loadMoreHrefBuilder?: (page: number) => string;
}

export function CollectionResults({
  result,
  pageSize,
  loadMoreHrefBuilder,
}: CollectionResultsProps) {
  // Read current sort from result if we want, or rely on URL. 
  // Let's pass 'newest' as fallback, SortSelect uses searchParams anyway.
  return (
    <div className="flex gap-10">
      {/* Sidebar Filters — desktop only */}
      <FilterSidebar showCategory={false} />

      {/* Product Grid */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-8">
          <p className="font-montserrat text-[14px] text-[#4d444f]">
            <span className="text-[#1d1b1e] font-semibold">{result.total}</span>{' '}
            {result.total === 1 ? 'piece' : 'pieces'}
          </p>
          <div className="flex items-center gap-4">
            <FilterMobileSheet showCategory={false} />
            <SortSelect sort="newest" options={SORT_OPTIONS} />
          </div>
        </div>

        {result.items.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-playfair text-[32px] font-semibold text-[#1d1b1e] mb-4">No pieces found</p>
            <p className="font-montserrat text-[16px] text-[#4d444f] mb-8">Try adjusting your filters.</p>
          </div>
        ) : loadMoreHrefBuilder ? (
          <LoadMoreGrid
            initialItems={result.items}
            initialPage={result.page}
            totalPages={result.pageCount}
            loadHref={loadMoreHrefBuilder}
          />
        ) : (
          <>
            <ProductGrid products={result.items} />
            <Pagination page={result.page} pageCount={result.pageCount} />
          </>
        )}

        <p className="sr-only">
          Showing page {result.page} of {result.pageCount} ({result.items.length} of {result.total} pieces)
        </p>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Page {result.page} of {result.pageCount} · {pageSize} per page
        </p>
      </div>
    </div>
  );
}
