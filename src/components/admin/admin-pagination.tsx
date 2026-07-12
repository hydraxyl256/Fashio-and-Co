'use client';

import Link from 'next/link';
import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';

interface AdminPaginationProps {
  page: number;
  pageCount: number;
  /** Href builder. The pagination uses it to render <a> tags. */
  buildHref: (page: number) => string;
  className?: string;
}

export function AdminPagination({ page, pageCount, buildHref, className }: AdminPaginationProps) {
  if (pageCount <= 1) return null;
  const prev = Math.max(1, page - 1);
  const next = Math.min(pageCount, page + 1);
  return (
    <nav
      className={cn('flex items-center justify-between gap-2 text-sm', className)}
      aria-label="Pagination"
    >
      <Link
        href={buildHref(prev)}
        aria-disabled={page <= 1}
        className={cn(
          'flex items-center gap-1 border border-border bg-card px-3 py-2 text-eyebrow uppercase',
          page <= 1 ? 'pointer-events-none opacity-40' : 'hover:bg-muted',
        )}
      >
        <ChevronLeft className="h-4 w-4" /> Previous
      </Link>
      <p className="text-muted-foreground">
        Page {page} of {pageCount}
      </p>
      <Link
        href={buildHref(next)}
        aria-disabled={page >= pageCount}
        className={cn(
          'flex items-center gap-1 border border-border bg-card px-3 py-2 text-eyebrow uppercase',
          page >= pageCount ? 'pointer-events-none opacity-40' : 'hover:bg-muted',
        )}
      >
        Next <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  );
}
