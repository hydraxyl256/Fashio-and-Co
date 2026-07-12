import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

import { requireStaffOrAdmin } from '@/lib/auth/session';
import { listAdminCategories } from '@/lib/admin/queries/tree';
import { formatNumber } from '@/lib/format';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminTable, type AdminColumn } from '@/components/admin/admin-table';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/admin/status-badge';

export const metadata = { title: 'Admin · Categories' };
export const dynamic = 'force-dynamic';

interface AdminCategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentName: string | null;
  displayOrder: number;
  isActive: boolean;
  productCount: number;
}

export default async function AdminCategoriesPage() {
  await requireStaffOrAdmin('/admin/categories');
  const categories = await listAdminCategories();
  const supabase = await (await import('@/lib/supabase/server')).createSupabaseServerClient();
  // Fetch a single product count per category.
  const { data: counts } = await supabase
    .from('products')
    .select('category_id')
    .eq('is_active', true);
  const countByCat = new Map<string, number>();
  for (const row of (counts ?? []) as Array<{ category_id: string | null }>) {
    if (!row.category_id) continue;
    countByCat.set(row.category_id, (countByCat.get(row.category_id) ?? 0) + 1);
  }
  const byId = new Map(categories.map((c) => [c.id, c]));
  const rows: AdminCategoryRow[] = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    parentName: c.parent_id ? byId.get(c.parent_id)?.name ?? null : null,
    displayOrder: c.display_order,
    isActive: c.is_active,
    productCount: countByCat.get(c.id) ?? 0,
  }));

  const columns: AdminColumn<AdminCategoryRow>[] = [
    {
      header: 'Category',
      mobileLabel: 'Category',
      cell: (row) => (
        <Link href={`/admin/categories/${row.id}`} className="block">
          <span className="font-medium">{row.name}</span>
          <span className="block text-xs text-muted-foreground font-mono">{row.slug}</span>
        </Link>
      ),
    },
    {
      header: 'Parent',
      mobileLabel: 'Parent',
      cell: (row) => row.parentName ?? <span className="text-muted-foreground">—</span>,
    },
    {
      header: 'Products',
      headerClassName: 'w-24 text-right',
      className: 'text-right text-sm',
      mobileLabel: 'Products',
      cell: (row) => formatNumber(row.productCount),
    },
    {
      header: 'Order',
      headerClassName: 'w-20 text-right',
      className: 'text-right text-xs text-muted-foreground',
      mobileLabel: 'Order',
      cell: (row) => formatNumber(row.displayOrder),
    },
    {
      header: 'Status',
      headerClassName: 'w-24',
      mobileLabel: 'Status',
      cell: (row) => (
        <StatusBadge variant={row.isActive ? 'active' : 'archived'}>{row.isActive ? 'active' : 'archived'}</StatusBadge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Catalogue"
        title="Categories"
        description="Group the products so the storefront stays navigable."
        actions={
          <Button asChild size="sm">
            <Link href="/admin/categories/new">
              <PlusCircle className="h-4 w-4" /> New category
            </Link>
          </Button>
        }
      />
      <AdminTable
        rowKey={(r) => r.id}
        columns={columns}
        data={rows}
        emptyMessage="No categories yet. Add your first one to start grouping products."
      />
    </div>
  );
}
