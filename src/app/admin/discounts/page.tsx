import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

import { requireStaffOrAdmin } from '@/lib/auth/session';
import { listAdminDiscounts } from '@/lib/admin/queries/discounts';
import { formatDate, formatNumber } from '@/lib/format';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminTable, type AdminColumn } from '@/components/admin/admin-table';
import { AdminPagination } from '@/components/admin/admin-pagination';
import { AdminFilterBar } from '@/components/admin/admin-filter-bar';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/admin/status-badge';
import { formatCurrency } from '@/lib/format';

export const metadata = { title: 'Admin · Discounts' };
export const dynamic = 'force-dynamic';

type StatusFilter = 'active' | 'inactive' | 'all';

export default async function AdminDiscountsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; status?: string }>;
}) {
  await requireStaffOrAdmin('/admin/discounts');
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? '1', 10) || 1);
  const status = (params.status as StatusFilter | undefined) ?? 'all';
  const { items, pagination } = await listAdminDiscounts({
    status,
    search: params.q,
    page,
    pageSize: 25,
  });

  const columns: AdminColumn<typeof items[number]>[] = [
    {
      header: 'Code',
      mobileLabel: 'Code',
      cell: (row) => (
        <Link href={`/admin/discounts/${row.id}`} className="block">
          <span className="font-mono text-sm">{row.code}</span>
          {row.description ? (
            <span className="block text-xs text-muted-foreground">{row.description}</span>
          ) : null}
        </Link>
      ),
    },
    {
      header: 'Discount',
      mobileLabel: 'Discount',
      cell: (row) => {
        if (row.kind === 'percentage') {
          return <span>{formatNumber(row.value / 100)}%</span>;
        }
        return <span>{formatCurrency(row.value, { currency: 'KES' })}</span>;
      },
    },
    {
      header: 'Applies',
      mobileLabel: 'Applies',
      cell: (row) => row.applies_to,
    },
    {
      header: 'Window',
      mobileLabel: 'Window',
      className: 'text-xs text-muted-foreground',
      cell: (row) =>
        row.starts_at || row.ends_at
          ? `${row.starts_at ? formatDate(row.starts_at, { dateStyle: 'short' }) : 'Anytime'} → ${
              row.ends_at ? formatDate(row.ends_at, { dateStyle: 'short' }) : 'No end'
            }`
          : 'Always',
    },
    {
      header: 'Used',
      headerClassName: 'w-20 text-right',
      className: 'text-right text-sm',
      mobileLabel: 'Used',
      cell: (row) =>
        `${row.redemptions_count}${row.max_redemptions ? ` / ${row.max_redemptions}` : ''}`,
    },
    {
      header: 'Status',
      headerClassName: 'w-24',
      mobileLabel: 'Status',
      cell: (row) => (
        <StatusBadge variant={row.is_active ? 'active' : 'archived'}>
          {row.is_active ? 'active' : 'inactive'}
        </StatusBadge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Promotions"
        title="Discounts"
        description="Codes customers can enter at checkout. Server-side validation keeps them honest."
        actions={
          <Button asChild size="sm">
            <Link href="/admin/discounts/new">
              <PlusCircle className="h-4 w-4" /> New discount
            </Link>
          </Button>
        }
      />
      <div className="space-y-3">
        <AdminFilterBar placeholder="Search code…">
          <div className="flex flex-wrap items-center gap-1 text-xs">
            {(['all', 'active', 'inactive'] as StatusFilter[]).map((s) => {
              const active = status === s;
              const next = new URLSearchParams();
              if (params.q) next.set('q', params.q);
              if (s !== 'all') next.set('status', s);
              return (
                <Link
                  key={s}
                  href={next.toString() ? `/admin/discounts?${next}` : '/admin/discounts'}
                  className={`border px-2 py-1 text-eyebrow uppercase transition-colors ${
                    active
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {s}
                </Link>
              );
            })}
          </div>
        </AdminFilterBar>
        <p className="text-xs text-muted-foreground">
          {pagination.total} {pagination.total === 1 ? 'discount' : 'discounts'} matched.
        </p>
        <AdminTable
          rowKey={(r) => r.id}
          columns={columns}
          data={items}
          emptyMessage="No discount codes yet."
        />
        <AdminPagination
          page={pagination.page}
          pageCount={pagination.pageCount}
          buildHref={(p) => {
            const next = new URLSearchParams();
            if (params.q) next.set('q', params.q);
            if (status !== 'all') next.set('status', status);
            if (p > 1) next.set('page', String(p));
            const query = next.toString();
            return query ? `/admin/discounts?${query}` : '/admin/discounts';
          }}
        />
      </div>
    </div>
  );
}
