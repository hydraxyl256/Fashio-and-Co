'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';

import { cn } from '@/lib/utils';

interface SearchInputProps {
  className?: string;
  initialQuery?: string;
  placeholder?: string;
  autoFocus?: boolean;
  onSubmit?: (query: string) => void;
}

/**
 * Storefront search input. Submits by pushing to /search?q=... so
 * the query is reflected in the URL (and shareable).
 */
export function SearchInput({
  className,
  initialQuery = '',
  placeholder = 'Search the edit — linen, brass, cuff…',
  autoFocus = false,
  onSubmit,
}: SearchInputProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = React.useState(initialQuery);

  React.useEffect(() => setQ(initialQuery), [initialQuery]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = q.trim();
    if (onSubmit) {
      onSubmit(trimmed);
      return;
    }
    if (!trimmed) {
      router.push('/search');
      return;
    }
    const next = new URLSearchParams(params?.toString() ?? '');
    next.set('q', trimmed);
    next.delete('page');
    router.push(`/search?${next.toString()}`);
  };

  return (
    <form role="search" onSubmit={submit} className={cn('relative', className)}>
      <Search
        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <input
        type="search"
        name="q"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        aria-label="Search products"
        className="h-12 w-full border border-input bg-background pl-11 pr-12 text-sm placeholder:text-muted-foreground/70 focus:border-foreground focus:outline-none"
      />
      {q ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => setQ('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      ) : null}
    </form>
  );
}
