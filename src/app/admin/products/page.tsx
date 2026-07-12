import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

import { requireStaffOrAdmin } from '@/lib/auth/session';
import { listAdminCategories } from '@/lib/admin/queries/tree';
import { listAdminProducts } from '@/lib/admin/queries/products';
import { formatCurrency, formatDate, formatNumber } from '@/lib/format';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminTable, type AdminColumn } from '@/components/admin/admin-table';
import { AdminPagination } from '@/components/admin/admin-pagination';
import { AdminFilterBar } from '@/components/admin/admin-filter-bar';
import { StatusBadge } from '@/components/admin/status-badge';
import { publicImageUrl } from '@/lib/admin/storage';
import { Button } from '@/components/ui/button';
import type { AdminProductRow } from '@/lib/admin/queries/products';

export const metadata = { title: 'Admin · Products' };
export const dynamic = 'force-dynamic';

type StatusFilter = 'active' | 'archived' | 'all';

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; status?: string; category?: string }>;
}) {
  await requireStaffOrAdmin('/admin/products');
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? '1', 10) || 1);
  const status = (params.status as StatusFilter | undefined) ?? 'all';
  const categories = await listAdminCategories();
  const { items, pagination } = await listAdminProducts({
    status,
    search: params.q,
    categoryId: params.category,
    page,
    pageSize: 25,
  });

  const columns: AdminColumn<AdminProductRow>[] = [
    {
      header: 'Product',
      mobileLabel: 'Product',
      cell: (row) => (
        <Link href={`/admin/products/${row.id}`} className="flex items-center gap-3">
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
      header: 'Category',
      mobileLabel: 'Category',
      cell: (row) => row.category?.name ?? '—',
    },
    {
      header: 'Price',
      headerClassName: 'w-28 text-right',
      className: 'text-right text-sm',
      mobileLabel: 'Price',
      cell: (row) => formatCurrency(row.priceCents, { currency: row.currency }),
    },
    {
      header: 'Variants',
      headerClassName: 'w-16 text-right',
      className: 'text-right text-xs',
      mobileLabel: 'Variants',
      cell: (row) => formatNumber(row.variantsCount),
    },
    {
      header: 'Stock',
      headerClassName: 'w-20 text-right',
      className: 'text-right text-sm',
      mobileLabel: 'Stock',
      cell: (row) => formatNumber(row.stockTotal),
    },
    {
      header: 'Updated',
      headerClassName: 'w-32',
      className: 'text-xs text-muted-foreground',
      mobileLabel: 'Updated',
      cell: (row) => formatDate(row.updatedAt, { dateStyle: 'medium' }),
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
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Catalogue"
        title="Products"
        description="Create, edit, and publish every product in the house."
        actions={
          <Button asChild size="sm">
            <Link href="/admin/products/new">
              <PlusCircle className="h-4 w-4" /> New product
            </Link>
          </Button>
        }
      />

      <div className="space-y-3">
        <AdminFilterBar placeholder="Search name or slug…">
          <div className="flex flex-wrap items-center gap-1 text-xs">
            {(['all', 'active', 'archived'] as StatusFilter[]).map((s) => {
              const active = status === s;
              const next = new URLSearchParams();
              if (params.q) next.set('q', params.q);
              if (params.category) next.set('category', params.category);
              if (s !== 'all') next.set('status', s);
              return (
                <Link
                  key={s}
                  href={next.toString() ? `/admin/products?${next}` : '/admin/products'}
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

        {categories.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1 text-xs">
            <Link
              href={params.q ? `/admin/products?q=${params.q}` : '/admin/products'}
              className={`border px-2 py-1 text-eyebrow uppercase ${
                !params.category
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              All categories
            </Link>
            {categories.map((c) => {
              const active = params.category === c.id;
              const next = new URLSearchParams();
              if (params.q) next.set('q', params.q);
              if (status !== 'all') next.set('status', status);
              next.set('category', c.id);
              return (
                <Link
                  key={c.id}
                  href={`/admin/products?${next}`}
                  className={`border px-2 py-1 text-eyebrow uppercase ${
                    active
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {c.name}
                </Link>
              );
            })}
          </div>
        ) : null}

        <p className="text-xs text-muted-foreground">
          {pagination.total} {pagination.total === 1 ? 'product' : 'products'} matched.
        </p>

        <AdminTable
          rowKey={(r) => r.id}
          columns={columns}
          data={items}
          emptyMessage="No products match your filters."
        />

        <AdminPagination
          page={pagination.page}
          pageCount={pagination.pageCount}
          buildHref={(p) => {
            const next = new URLSearchParams();
            if (params.q) next.set('q', params.q);
            if (params.category) next.set('category', params.category);
            if (status !== 'all') next.set('status', status);
            if (p > 1) next.set('page', String(p));
            const query = next.toString();
            return query ? `/admin/products?${query}` : '/admin/products';
          }}
        />
      </div>
    </div>
  );
}
