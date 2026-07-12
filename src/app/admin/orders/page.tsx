import Link from 'next/link';

import { requireStaffOrAdmin } from '@/lib/auth/session';
import { formatCurrency, formatDate } from '@/lib/format';
import { listAdminOrders } from '@/lib/admin/queries/orders';
import { ALL_ORDER_STATUSES, statusLabel } from '@/lib/admin/state-machine';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminTable, type AdminColumn } from '@/components/admin/admin-table';
import { AdminPagination } from '@/components/admin/admin-pagination';
import { AdminFilterBar } from '@/components/admin/admin-filter-bar';
import { StatusBadge } from '@/components/admin/status-badge';
import type { AdminOrderListRow } from '@/lib/admin/queries/orders';
import type { OrderStatus } from '@/types/database';

export const metadata = { title: 'Admin · Orders' };
export const dynamic = 'force-dynamic';

const STATUS_VALUES = ALL_ORDER_STATUSES as readonly OrderStatus[];

interface SearchParamsShape {
  page?: string;
  q?: string;
  status?: string;
  from?: string;
  to?: string;
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsShape>;
}) {
  await requireStaffOrAdmin('/admin/orders');
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? '1', 10) || 1);
  const pageSize = 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const statusFilter = (params.status ?? '').split(',').filter((s): s is OrderStatus =>
    (STATUS_VALUES as readonly string[]).includes(s),
  );

  const { items, pagination } = await listAdminOrders({
    status: statusFilter.length > 0 ? statusFilter : undefined,
    search: params.q,
    from: params.from,
    to: params.to,
    page,
    pageSize,
  });

  const columns: AdminColumn<AdminOrderListRow>[] = [
    {
      header: 'Order',
      headerClassName: 'w-32',
      className: 'font-mono text-xs',
      mobileLabel: 'Order',
      cell: (row) => <Link href={`/admin/orders/${row.id}`}>{row.orderNumber}</Link>,
    },
    {
      header: 'Customer',
      mobileLabel: 'Customer',
      cell: (row) => row.customerName ?? row.customerEmail,
    },
    {
      header: 'Placed',
      mobileLabel: 'Placed',
      cell: (row) => formatDate(row.placedAt, { dateStyle: 'medium' }),
    },
    {
      header: 'Status',
      mobileLabel: 'Status',
      cell: (row) => <StatusBadge variant={row.status}>{statusLabel(row.status)}</StatusBadge>,
    },
    {
      header: 'Items',
      headerClassName: 'w-12 text-right',
      className: 'text-right text-xs',
      mobileLabel: 'Items',
      cell: (row) => row.itemsCount,
    },
    {
      header: 'Total',
      headerClassName: 'w-32 text-right',
      className: 'text-right font-medium',
      mobileLabel: 'Total',
      cell: (row) => formatCurrency(row.totalCents, { currency: row.currency }),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Operations"
        title="Orders"
        description="Search, filter, and update the lifecycle of every order in the house."
      />

      <div className="space-y-3">
        <AdminFilterBar placeholder="Search order #, email, or phone…">
          <StatusFilter status={statusFilter} />
        </AdminFilterBar>

        <p className="text-xs text-muted-foreground">
          {pagination.total} {pagination.total === 1 ? 'order' : 'orders'} matched.
        </p>

        <AdminTable
          rowKey={(r) => r.id}
          columns={columns}
          data={items}
          emptyMessage="No orders match the current filters."
        />

        <AdminPagination
          page={pagination.page}
          pageCount={pagination.pageCount}
          buildHref={(p) => {
            const next = new URLSearchParams();
            if (params.q) next.set('q', params.q);
            if (params.status) next.set('status', params.status);
            if (params.from) next.set('from', params.from);
            if (params.to) next.set('to', params.to);
            if (p > 1) next.set('page', String(p));
            const query = next.toString();
            return query ? `/admin/orders?${query}` : '/admin/orders';
          }}
        />
      </div>
    </div>
  );
}

function StatusFilter({ status }: { status: OrderStatus[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1 text-xs">
      {STATUS_VALUES.map((s) => {
        const active = status.includes(s);
        const next = new URLSearchParams();
        if (active) {
          // remove this status
          status.filter((x) => x !== s).forEach((x) => next.set('status', x));
        } else {
          [...status, s].forEach((x) => next.set('status', x));
        }
        return (
          <Link
            key={s}
            href={next.toString() ? `/admin/orders?${next}` : '/admin/orders'}
            className={`border px-2 py-1 text-eyebrow uppercase transition-colors ${
              active
                ? 'border-foreground bg-foreground text-background'
                : 'border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {statusLabel(s)}
          </Link>
        );
      })}
    </div>
  );
}
