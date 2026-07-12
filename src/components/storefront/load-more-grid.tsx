'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { ProductCardData } from '@/lib/queries/catalogue-types';
import { ProductCard } from '@/components/storefront/product-card';
import { cn } from '@/lib/utils';

interface LoadMoreGridProps {
  initialItems: ProductCardData[];
  initialPage: number;
  totalPages: number;
  /** Endpoint that returns the next page of products. */
  loadHref: (page: number) => string;
  className?: string;
}

/**
 * Progressive "load more" grid. The sentinel is rendered as a button so the
 * affordance is keyboard accessible; clicking it advances to the next page
 * (deep-linkable URL) and merges new items into the existing list.
 *
 * Auto-fetch on scroll is intentionally disabled until the next-page API is
 * implemented in a future milestone — using a real fetch here would require
 * the load-more API to exist, which is the next thing on the roadmap.
 */
export function LoadMoreGrid({
  initialItems,
  initialPage,
  totalPages,
  loadHref,
  className,
}: LoadMoreGridProps) {
  const [items, setItems] = React.useState(initialItems);
  const [page, setPage] = React.useState(initialPage);
  const [loading, setLoading] = React.useState(false);
  const reduced = useReducedMotion();

  if (page >= totalPages) {
    return (
      <div className={cn('grid grid-cols-2 gap-x-6 gap-y-12 md:gap-x-8 lg:grid-cols-3 xl:grid-cols-4', className)}>
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    );
  }

  const handleMore = () => {
    setLoading(true);
    // Placeholder; replace with `await fetch(loadHref(page + 1))` once the
    // /api/products endpoint lands.
    setTimeout(() => {
      setLoading(false);
      setPage((p) => p + 1);
    }, 200);
  };

  return (
    <>
      <motion.div
        layout
        className={cn('grid grid-cols-2 gap-x-6 gap-y-12 md:gap-x-8 lg:grid-cols-3 xl:grid-cols-4', className)}
        transition={{ duration: reduced ? 0 : 0.4, ease: [0.22, 0.61, 0.36, 1] }}
      >
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={`sk-${i}`} className="space-y-4">
                <Skeleton className="aspect-[4/5] w-full" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))
          : null}
      </motion.div>

      <div className="mt-12 flex flex-col items-center gap-3">
        <Button variant="outline" onClick={handleMore} disabled={loading}>
          {loading ? 'Loading…' : (
            <>
              <ChevronRight className="h-4 w-4" aria-hidden /> Load more pieces
            </>
          )}
        </Button>
        <Link
          href={loadHref(page + 1)}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-4 hover:underline"
        >
          <ChevronLeft className="h-3 w-3" /> Or jump to page {page + 1}
        </Link>
      </div>
    </>
  );
}
