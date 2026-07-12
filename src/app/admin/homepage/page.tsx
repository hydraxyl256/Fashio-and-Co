import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

import { requireStaffOrAdmin } from '@/lib/auth/session';
import { listAdminHomepageSections } from '@/lib/admin/queries/homepage';
import { formatDate, formatNumber } from '@/lib/format';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminTable, type AdminColumn } from '@/components/admin/admin-table';
import { AdminPagination } from '@/components/admin/admin-pagination';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/admin/status-badge';

export const metadata = { title: 'Admin · Homepage' };
export const dynamic = 'force-dynamic';

export default async function AdminHomepagePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireStaffOrAdmin('/admin/homepage');
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? '1', 10) || 1);
  const { items, pagination } = await listAdminHomepageSections({ page, pageSize: 25 });

  const columns: AdminColumn<typeof items[number]>[] = [
    {
      header: 'Section',
      mobileLabel: 'Section',
      cell: (row) => (
        <Link href={`/admin/homepage/${row.id}`} className="block">
          <span className="font-medium">{row.title ?? row.slug}</span>
          <span className="block text-xs text-muted-foreground font-mono">{row.slug}</span>
        </Link>
      ),
    },
    {
      header: 'Kind',
      headerClassName: 'w-32',
      className: 'text-xs uppercase tracking-wider text-muted-foreground',
      mobileLabel: 'Kind',
      cell: (row) => row.kind,
    },
    {
      header: 'Order',
      headerClassName: 'w-16 text-right',
      className: 'text-right text-sm',
      mobileLabel: 'Order',
      cell: (row) => formatNumber(row.display_order),
    },
    {
      header: 'Window',
      headerClassName: 'w-44',
      className: 'text-xs text-muted-foreground',
      mobileLabel: 'Window',
      cell: (row) =>
        row.starts_at || row.ends_at
          ? `${row.starts_at ? formatDate(row.starts_at, { dateStyle: 'short' }) : 'Anytime'} → ${
              row.ends_at ? formatDate(row.ends_at, { dateStyle: 'short' }) : 'No end'
            }`
          : 'Always',
    },
    {
      header: 'Status',
      headerClassName: 'w-24',
      mobileLabel: 'Status',
      cell: (row) => (
        <StatusBadge variant={row.is_active ? 'active' : 'archived'}>
          {row.is_active ? 'active' : 'archived'}
        </StatusBadge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Editorial"
        title="Homepage"
        description="Curation, in display order, of the sections that make up the storefront home."
        actions={
          <Button asChild size="sm">
            <Link href="/admin/homepage/new">
              <PlusCircle className="h-4 w-4" /> New section
            </Link>
          </Button>
        }
      />
      <p className="text-xs text-muted-foreground">
        {pagination.total} {pagination.total === 1 ? 'section' : 'sections'} configured.
      </p>
      <AdminTable
        rowKey={(r) => r.id}
        columns={columns}
        data={items}
        emptyMessage="No homepage sections yet."
      />
      <AdminPagination
        page={pagination.page}
        pageCount={pagination.pageCount}
        buildHref={(p) => {
          const next = new URLSearchParams();
          if (p > 1) next.set('page', String(p));
          const query = next.toString();
          return query ? `/admin/homepage?${query}` : '/admin/homepage';
        }}
      />
    </div>
  );
}
