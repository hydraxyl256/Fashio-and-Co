import Link from 'next/link';

import { requireStaffOrAdmin } from '@/lib/auth/session';
import { listAdminProducts } from '@/lib/admin/queries/products';
import { getLowStockVariants } from '@/lib/admin/queries/inventory';
import { formatNumber } from '@/lib/format';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminTable, type AdminColumn } from '@/components/admin/admin-table';
import { StatusBadge } from '@/components/admin/status-badge';
import { publicImageUrl } from '@/lib/admin/storage';
import type { AdminProductRow } from '@/lib/admin/queries/products';
import type { LowStockEntry } from '@/lib/admin/queries/inventory';

export const metadata = { title: 'Admin · Inventory' };
export const dynamic = 'force-dynamic';

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireStaffOrAdmin('/admin/inventory');
  const params = await searchParams;
  const { items: products } = await listAdminProducts({
    status: 'all',
    search: params.q,
    page: 1,
    pageSize: 100,
  });
  const lowStock = await getLowStockVariants(50);

  const columns: AdminColumn<AdminProductRow>[] = [
    {
      header: 'Product',
      mobileLabel: 'Product',
      cell: (row) => (
        <Link
          href={`/admin/products/${row.id}/inventory`}
          className="flex items-center gap-3"
        >
          <span className="h-10 w-10 shrink-0 bg-muted">
            {row.cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={publicImageUrl(row.cover.storagePath)}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : null}
          </span>
          <span>
            <span className="font-medium">{row.name}</span>
            <span className="block text-xs text-muted-foreground font-mono">{row.slug}</span>
          </span>
        </Link>
      ),
    },
    {
      header: 'Variants',
      headerClassName: 'w-20 text-right',
      className: 'text-right text-xs',
      mobileLabel: 'Variants',
      cell: (row) => row.variantsCount,
    },
    {
      header: 'Stock total',
      headerClassName: 'w-32 text-right',
      className: 'text-right text-sm',
      mobileLabel: 'Stock',
      cell: (row) => formatNumber(row.stockTotal),
    },
    {
      header: 'Status',
      headerClassName: 'w-24',
      mobileLabel: 'Status',
      cell: (row) => (
        <StatusBadge variant={row.status === 'active' ? 'active' : 'archived'}>
          {row.status}
        </StatusBadge>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Catalogue"
        title="Inventory"
        description="Review stock totals, drill into a product to adjust quantities, and watch the low-stock list."
      />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="eyebrow">Low-stock variants</p>
          <span className="text-xs text-muted-foreground">
            {lowStock.length} {lowStock.length === 1 ? 'item' : 'items'} at or below threshold
          </span>
        </div>
        <ul className="divide-y divide-border border border-border bg-card">
          {lowStock.map((entry) => (
            <LowStockRow key={entry.id} entry={entry} />
          ))}
          {lowStock.length === 0 ? (
            <li className="px-6 py-8 text-center text-sm text-muted-foreground">
              Nothing is low right now. Lovely.
            </li>
          ) : null}
        </ul>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="eyebrow">All products</p>
          <p className="text-xs text-muted-foreground">
            {products.length} {products.length === 1 ? 'product' : 'products'}
          </p>
        </div>
        <AdminTable
          rowKey={(p) => p.id}
          columns={columns}
          data={products}
          emptyMessage="No products match your filters."
        />
      </section>
    </div>
  );
}

function LowStockRow({ entry }: { entry: LowStockEntry }) {
  return (
    <li className="flex items-center justify-between gap-3 p-4 text-sm">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{entry.product_name}</p>
        <p className="truncate text-xs text-muted-foreground font-mono">
          {entry.sku}
          {entry.size ? ` · ${entry.size}` : ''}
          {entry.color ? ` · ${entry.color}` : ''}
          {entry.metal ? ` · ${entry.metal}` : ''}
        </p>
      </div>
      <div className="text-right text-xs">
        <StatusBadge variant="low_stock" className="!text-[0.6rem]">
          {entry.available} available
        </StatusBadge>
        <p className="mt-1 text-muted-foreground">
          Threshold {entry.low_stock_threshold}
        </p>
      </div>
      <Link
        href={`/admin/products/${entry.product_id}/inventory`}
        className="ml-3 text-eyebrow uppercase text-muted-foreground hover:text-foreground"
      >
        Adjust →
      </Link>
    </li>
  );
}
