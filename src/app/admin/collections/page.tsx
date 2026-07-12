import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

import { requireStaffOrAdmin } from '@/lib/auth/session';
import { listAdminCollections } from '@/lib/admin/queries/tree';
import { formatDate, formatNumber } from '@/lib/format';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminTable, type AdminColumn } from '@/components/admin/admin-table';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/admin/status-badge';

export const metadata = { title: 'Admin · Collections' };
export const dynamic = 'force-dynamic';

export default async function AdminCollectionsPage() {
  await requireStaffOrAdmin('/admin/collections');
  const collections = await listAdminCollections();

  const columns: AdminColumn<typeof collections[number]>[] = [
    {
      header: 'Collection',
      mobileLabel: 'Collection',
      cell: (row) => (
        <Link href={`/admin/collections/${row.id}`} className="block">
          <span className="font-medium">{row.name}</span>
          <span className="block text-xs text-muted-foreground font-mono">{row.slug}</span>
        </Link>
      ),
    },
    {
      header: 'Products',
      headerClassName: 'w-24 text-right',
      className: 'text-right text-sm',
      mobileLabel: 'Products',
      cell: (row) => formatNumber(row.productsCount),
    },
    {
      header: 'Launch',
      headerClassName: 'w-32',
      className: 'text-xs text-muted-foreground',
      mobileLabel: 'Launch',
      cell: (row) =>
        row.launch_at ? formatDate(row.launch_at, { dateStyle: 'medium' }) : '—',
    },
    {
      header: 'Featured',
      headerClassName: 'w-24',
      mobileLabel: 'Featured',
      cell: (row) =>
        row.is_featured ? (
          <span className="inline-flex items-center border border-accent/50 bg-accent/10 px-2 py-0.5 text-eyebrow uppercase text-accent">
            Featured
          </span>
        ) : (
          '—'
        ),
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
        eyebrow="Catalogue"
        title="Collections"
        description="Story-driven groupings that drive the storefront and homepage features."
        actions={
          <Button asChild size="sm">
            <Link href="/admin/collections/new">
              <PlusCircle className="h-4 w-4" /> New collection
            </Link>
          </Button>
        }
      />
      <AdminTable
        rowKey={(r) => r.id}
        columns={columns}
        data={collections}
        emptyMessage="No collections yet. Create one to start curating stories."
      />
    </div>
  );
}
