import * as React from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

export interface AdminColumn<T> {
  /** Heading shown in <thead>. Plain text, no HTML. */
  header: string;
  /** Cell renderer for each row. */
  cell: (row: T) => React.ReactNode;
  /** Tailwind class string for the cell (e.g. 'text-right', 'font-mono'). */
  className?: string;
  /** Tailwind class string for the <th>. */
  headerClassName?: string;
  /** Optional mobile card label — if absent, the cell is hidden on mobile. */
  mobileLabel?: string;
}

interface AdminTableProps<T> {
  /** Stable id used as the row key. */
  rowKey: (row: T) => string;
  columns: AdminColumn<T>[];
  data: T[];
  emptyMessage?: string;
  /** Tailwind class for the outer container. */
  className?: string;
  /** Click handler — wraps the row in a button. */
  onRowClick?: (row: T) => void;
}

/**
 * Responsive data table used by every admin list. On mobile (<md), the
 * table collapses into a stacked card layout where each cell becomes a
 * labelled field. On desktop it's a regular table.
 */
export function AdminTable<T>({
  rowKey,
  columns,
  data,
  emptyMessage = 'Nothing to show yet.',
  className,
  onRowClick,
}: AdminTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="border border-dashed border-border bg-muted/30 px-6 py-12 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }
  return (
    <div className={cn('border border-border bg-card', className)}>
      {/* Desktop */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col, idx) => (
                <TableHead key={idx} className={col.headerClassName}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => {
              const key = rowKey(row);
              return (
                <TableRow
                  key={key}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(onRowClick && 'cursor-pointer focus-within:bg-muted/40')}
                >
                  {columns.map((col, idx) => (
                    <TableCell key={idx} className={col.className}>
                      {col.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      {/* Mobile */}
      <ul className="md:hidden">
        {data.map((row) => (
          <li
            key={rowKey(row)}
            className={cn(
              'border-b border-border p-4 last:border-b-0',
              onRowClick && 'cursor-pointer hover:bg-muted/40',
            )}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
          >
            <dl className="space-y-2">
              {columns
                .filter((c) => c.mobileLabel)
                .map((col, idx) => (
                  <div key={idx} className="flex items-baseline gap-3">
                    <dt className="w-28 shrink-0 text-eyebrow uppercase text-muted-foreground">
                      {col.mobileLabel}
                    </dt>
                    <dd className="flex-1 text-sm">{col.cell(row)}</dd>
                  </div>
                ))}
            </dl>
          </li>
        ))}
      </ul>
    </div>
  );
}
