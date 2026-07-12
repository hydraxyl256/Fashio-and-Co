import Link from 'next/link';

import { requireStaffOrAdmin } from '@/lib/auth/session';
import { listAdminCustomers } from '@/lib/admin/queries/customers';
import { formatCurrency, formatDate, formatNumber } from '@/lib/format';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminTable, type AdminColumn } from '@/components/admin/admin-table';
import { AdminPagination } from '@/components/admin/admin-pagination';
import { AdminFilterBar } from '@/components/admin/admin-filter-bar';

export const metadata = { title: 'Admin · Customers' };
export const dynamic = 'force-dynamic';

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  await requireStaffOrAdmin('/admin/customers');
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? '1', 10) || 1);
  const { items, pagination } = await listAdminCustomers({
    search: params.q,
    page,
    pageSize: 25,
  });

  const columns: AdminColumn<typeof items[number]>[] = [
    {
      header: 'Customer',
      mobileLabel: 'Customer',
      cell: (row) => (
        <div>
          <p className="font-medium">{row.fullName ?? '—'}</p>
          <p className="text-xs text-muted-foreground">{row.email}</p>
        </div>
      ),
    },
    {
      header: 'Phone',
      mobileLabel: 'Phone',
      cell: (row) => row.phone ?? <span className="text-muted-foreground">—</span>,
    },
    {
      header: 'Joined',
      headerClassName: 'w-32',
      className: 'text-xs text-muted-foreground',
      mobileLabel: 'Joined',
      cell: (row) => formatDate(row.createdAt, { dateStyle: 'medium' }),
    },
    {
      header: 'Orders',
      headerClassName: 'w-20 text-right',
      className: 'text-right text-sm',
      mobileLabel: 'Orders',
      cell: (row) => formatNumber(row.ordersCount),
    },
    {
      header: 'Lifetime',
      headerClassName: 'w-32 text-right',
      className: 'text-right text-sm',
      mobileLabel: 'Lifetime',
      cell: (row) =>
        row.totalSpentCents > 0
          ? formatCurrency(row.totalSpentCents, { currency: 'KES' })
          : '—',
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="People"
        title="Customers"
        description="Every account in the system. Read-only — customer data is owned by the customer."
      />
      <div className="space-y-3">
        <AdminFilterBar placeholder="Search email, name, or phone…" />
        <p className="text-xs text-muted-foreground">
          {pagination.total} {pagination.total === 1 ? 'customer' : 'customers'} matched.
        </p>
        <AdminTable
          rowKey={(r) => r.id}
          columns={columns}
          data={items}
          emptyMessage="No customers match your filters."
        />
        <AdminPagination
          page={pagination.page}
          pageCount={pagination.pageCount}
          buildHref={(p) => {
            const next = new URLSearchParams();
            if (params.q) next.set('q', params.q);
            if (p > 1) next.set('page', String(p));
            const query = next.toString();
            return query ? `/admin/customers?${query}` : '/admin/customers';
          }}
        />
      </div>
    </div>
  );
}
