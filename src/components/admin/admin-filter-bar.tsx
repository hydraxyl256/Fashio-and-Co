'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface AdminFilterBarProps {
  className?: string;
  placeholder?: string;
  /** When provided, renders a "Clear" link that resets all search params. */
  showClear?: boolean;
  /** Optional children — render extra controls (selects, checkboxes) to the right. */
  children?: React.ReactNode;
}

/**
 * URL-driven filter bar. Renders a search input + a submit button; on
 * submit it pushes a new URL with `?q=…` (and clears `page`). The
 * page re-renders with the updated `searchParams`.
 */
export function AdminFilterBar({
  className,
  placeholder = 'Search…',
  showClear = true,
  children,
}: AdminFilterBarProps) {
  const router = useRouter();
  const params = useSearchParams();
  const initial = params.get('q') ?? '';
  const [q, setQ] = React.useState(initial);

  React.useEffect(() => {
    setQ(initial);
  }, [initial]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next = new URLSearchParams(params.toString());
    if (q.trim().length > 0) {
      next.set('q', q.trim());
    } else {
      next.delete('q');
    }
    next.delete('page');
    router.push(`?${next.toString()}`);
  }

  function onClear() {
    setQ('');
    router.push('?');
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div className="flex flex-1 items-end gap-2">
        <div className="flex-1">
          <Label htmlFor="q-input" className="sr-only">
            Search
          </Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="q-input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={placeholder}
              className="h-10 pl-9"
            />
          </div>
        </div>
        <Button type="submit" size="sm" variant="outline">
          Search
        </Button>
        {showClear ? (
          <Button type="button" size="sm" variant="ghost" onClick={onClear}>
            Clear
          </Button>
        ) : null}
      </div>
      {children}
    </form>
  );
}
