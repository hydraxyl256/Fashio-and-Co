'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';

interface PaginationProps {
  page: number;
  pageCount: number;
}

export function Pagination({ page, pageCount }: PaginationProps) {
  const pathname = usePathname();
  const params = useSearchParams();

  if (pageCount <= 1) return null;

  const buildHref = (target: number) => {
    const next = new URLSearchParams(params.toString());
    if (target <= 1) next.delete('page');
    else next.set('page', String(target));
    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
      <Link
        href={buildHref(Math.max(1, page - 1))}
        aria-disabled={page <= 1}
        tabIndex={page <= 1 ? -1 : 0}
        className={cn(
          'flex h-10 items-center gap-1 border border-border px-3 text-eyebrow uppercase transition-colors',
          page <= 1
            ? 'pointer-events-none opacity-40'
            : 'hover:border-foreground hover:text-foreground',
        )}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden /> Prev
      </Link>

      <div className="flex items-center gap-1">
        {Array.from({ length: pageCount }).map((_, i) => {
          const n = i + 1;
          const active = n === page;
          return (
            <Link
              key={n}
              href={buildHref(n)}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex h-10 w-10 items-center justify-center border text-sm',
                active
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border text-foreground hover:border-foreground',
              )}
            >
              {n}
            </Link>
          );
        })}
      </div>

      <Link
        href={buildHref(Math.min(pageCount, page + 1))}
        aria-disabled={page >= pageCount}
        tabIndex={page >= pageCount ? -1 : 0}
        className={cn(
          'flex h-10 items-center gap-1 border border-border px-3 text-eyebrow uppercase transition-colors',
          page >= pageCount
            ? 'pointer-events-none opacity-40'
            : 'hover:border-foreground hover:text-foreground',
        )}
      >
        Next <ChevronRight className="h-4 w-4" aria-hidden />
      </Link>
    </nav>
  );
}
