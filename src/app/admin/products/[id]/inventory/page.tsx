import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { requireStaffOrAdmin } from '@/lib/auth/session';
import { getProductForEdit } from '@/lib/admin/queries/products';
import { getVariantsForProduct, getVariantForAdjust } from '@/lib/admin/queries/inventory';
import type { MovementRow, VariantWithProduct } from '@/app/admin/products/[id]/inventory/_types';
import { formatDate, formatNumber } from '@/lib/format';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { StockAdjustForm } from './stock-adjust-form';
import { adjustStockAction } from '@/lib/admin/actions/inventory';

export const metadata = { title: 'Admin · Inventory' };
export const dynamic = 'force-dynamic';

export default async function AdminProductInventoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaffOrAdmin('/admin/inventory');
  const { id } = await params;
  const productData = await getProductForEdit(id);
  if (!productData.product) notFound();
  const variants: VariantWithProduct[] = await getVariantsForProduct(id);

  // Fetch movement history for each variant in parallel.
  const movementLists = await Promise.all(
    variants.map(async (variant) => {
      const detail = await getVariantForAdjust(variant.id);
      return [variant.id, detail?.movements ?? []] as const;
    }),
  );
  const movementsByVariant = new Map<string, MovementRow[]>(movementLists);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/inventory"
          className="inline-flex items-center gap-1 text-eyebrow uppercase text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> All inventory
        </Link>
      </div>
      <AdminPageHeader
        eyebrow="Product"
        title={productData.product.name}
        description="Stock movements are recorded for the audit log. Direct stock edits are not allowed."
      />

      <section className="space-y-3">
        <p className="eyebrow">Variants</p>
        <div className="space-y-4">
          {variants.length === 0 ? (
            <p className="rounded-md border border-dashed border-border bg-muted/30 p-6 text-sm text-muted-foreground">
              This product has no variants yet. Add one in the product editor first.
            </p>
          ) : null}
          {variants.map((variant) => {
            const movements = movementsByVariant.get(variant.id) ?? [];
            return (
              <div key={variant.id} className="border border-border bg-card p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <p className="font-mono text-xs">{variant.sku}</p>
                    <p className="text-sm text-muted-foreground">
                      {[variant.size, variant.color, variant.material, variant.metal]
                        .filter((s): s is string => !!s)
                        .join(' · ') || 'No attributes'}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium">
                      {formatNumber(variant.stock_quantity - variant.reserved_quantity)} available
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(variant.stock_quantity)} in stock ·{' '}
                      {formatNumber(variant.reserved_quantity)} reserved · threshold{' '}
                      {formatNumber(variant.low_stock_threshold)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <StockAdjustForm
                    variantId={variant.id}
                    initialStock={variant.stock_quantity}
                    action={adjustStockAction}
                  />
                  <div className="space-y-2">
                    <p className="eyebrow text-muted-foreground">Last movements</p>
                    <ul className="max-h-64 overflow-y-auto divide-y divide-border border border-border">
                      {movements.length === 0 ? (
                        <li className="p-3 text-xs text-muted-foreground">No movements yet.</li>
                      ) : null}
                      {movements.map((m) => (
                        <li key={m.id} className="p-3 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-mono">{m.reason}</p>
                            <p
                              className={
                                m.delta > 0
                                  ? 'text-emerald-700'
                                  : m.delta < 0
                                    ? 'text-rose-700'
                                    : 'text-muted-foreground'
                              }
                            >
                              {m.delta > 0 ? `+${m.delta}` : m.delta}
                            </p>
                          </div>
                          <p className="text-muted-foreground">
                            {formatDate(m.created_at, { dateStyle: 'medium', timeStyle: 'short' })}
                            {m.note ? ` — ${m.note}` : ''}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
