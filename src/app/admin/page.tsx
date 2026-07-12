import Link from 'next/link';
import { PlusCircle, Tag, Wallet, Package } from 'lucide-react';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireStaffOrAdmin } from '@/lib/auth/session';
import { formatCurrency, formatDate, formatNumber } from '@/lib/format';
import { getOrderCountByStatus } from '@/lib/admin/queries/orders';
import { getLowStockVariants } from '@/lib/admin/queries/inventory';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { StatusBadge } from '@/components/admin/status-badge';
import { publicImageUrl } from '@/lib/admin/storage';
import type { OrderStatus } from '@/types/database';

export const metadata = { title: 'Admin · Overview' };
export const revalidate = 60;

interface OrderRow {
  id: string;
  order_number: string;
  customer_email: string;
  customer_full_name: string | null;
  status: OrderStatus;
  placed_at: string;
  total_cents: number;
  currency: string;
}

export default async function AdminOverviewPage() {
  const session = await requireStaffOrAdmin('/admin');
  const supabase = await createSupabaseServerClient();
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const startOf30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { data: today },
    { data: week },
    { data: month },
    { data: revenue30 },
    recentOrders,
    statusCounts,
    lowStock,
    { data: topProducts },
    { count: productCount },
  ] = await Promise.all([
    supabase.from('orders').select('total_cents, currency, status').gte('placed_at', startOfDay),
    supabase.from('orders').select('total_cents, currency, status').gte('placed_at', startOfWeek),
    supabase.from('orders').select('total_cents, currency, status').gte('placed_at', startOfMonth),
    supabase
      .from('orders')
      .select('total_cents, currency, status')
      .gte('placed_at', startOf30)
      .not('paid_at', 'is', null),
    supabase
      .from('orders')
      .select('id, order_number, customer_email, customer_full_name, status, placed_at, total_cents, currency')
      .order('placed_at', { ascending: false })
      .limit(8),
    getOrderCountByStatus(),
    getLowStockVariants(8),
    supabase
      .from('order_items')
      .select('product_id, product_name, quantity, unit_price_cents, currency, image_url')
      .gte('created_at', startOf30)
      .not('product_id', 'is', null)
      .limit(2000),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
  ]);

  function sumPaid(rows: Array<{ total_cents: number; status: OrderStatus; currency: string }> | null) {
    return (rows ?? [])
      .filter((r) => r.status !== 'cancelled' && r.status !== 'refunded')
      .reduce((acc, r) => acc + r.total_cents, 0);
  }

  const todayTotal = sumPaid(today);
  const weekTotal = sumPaid(week);
  const monthTotal = sumPaid(month);
  const revenue30Total = sumPaid(revenue30);

  // Aggregate top-selling products
  const productMap = new Map<
    string,
    { name: string; quantity: number; revenue: number; currency: string; image_url: string | null }
  >();
  for (const item of topProducts ?? []) {
    if (!item.product_id) continue;
    const key = item.product_id;
    const current = productMap.get(key) ?? {
      name: item.product_name,
      quantity: 0,
      revenue: 0,
      currency: item.currency,
      image_url: item.image_url,
    };
    current.quantity += item.quantity;
    current.revenue += item.unit_price_cents * item.quantity;
    productMap.set(key, current);
  }
  const topList = Array.from(productMap.entries())
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow="Atelier"
        title={`Good day, ${session.email.split('@')[0] ?? 'admin'}.`}
        description={`A snapshot of the storefront as of ${formatDate(now, { dateStyle: 'long' })}.`}
      />

      {/* Sales summary */}
      <section className="space-y-3">
        <p className="eyebrow">Sales</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Today" value={formatCurrency(todayTotal)} />
          <Stat label="Last 7 days" value={formatCurrency(weekTotal)} />
          <Stat label="This month" value={formatCurrency(monthTotal)} />
          <Stat
            label="Paid, last 30 days"
            value={formatCurrency(revenue30Total)}
            helper="Excludes cancelled and refunded orders"
          />
        </div>
      </section>

      {/* Order counts by status */}
      <section className="space-y-3">
        <p className="eyebrow">Orders by status</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(Object.keys(statusCounts) as OrderStatus[]).map((status) => (
            <div key={status} className="border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="eyebrow text-muted-foreground">{status.replace('_', ' ')}</p>
                <StatusBadge variant={status} className="!py-0 !text-[0.6rem]" />
              </div>
              <p className="mt-2 font-serif text-2xl">{formatNumber(statusCounts[status])}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent orders */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="eyebrow">Recent orders</p>
            <Link
              href="/admin/orders"
              className="text-eyebrow uppercase text-muted-foreground hover:text-foreground"
            >
              View all →
            </Link>
          </div>
          <ul className="divide-y divide-border border border-border bg-card">
            {(recentOrders.data ?? []).map((order) => (
              <OrderRowItem key={order.id} order={order as OrderRow} />
            ))}
            {(!recentOrders.data || recentOrders.data.length === 0) ? (
              <li className="px-6 py-8 text-center text-sm text-muted-foreground">No orders yet.</li>
            ) : null}
          </ul>
        </section>

        {/* Low stock */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="eyebrow">Low stock</p>
            <Link
              href="/admin/inventory"
              className="text-eyebrow uppercase text-muted-foreground hover:text-foreground"
            >
              Manage inventory →
            </Link>
          </div>
          <ul className="divide-y divide-border border border-border bg-card">
            {lowStock.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between gap-3 p-4 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{entry.product_name}</p>
                  <p className="truncate text-xs text-muted-foreground font-mono">
                    {entry.sku}
                    {entry.size ? ` · ${entry.size}` : ''}
                    {entry.color ? ` · ${entry.color}` : ''}
                  </p>
                </div>
                <div className="text-right text-xs">
                  <StatusBadge variant="low_stock" className="!text-[0.6rem]">
                    {entry.available} left
                  </StatusBadge>
                </div>
              </li>
            ))}
            {lowStock.length === 0 ? (
              <li className="px-6 py-8 text-center text-sm text-muted-foreground">
                No variants at or below their threshold.
              </li>
            ) : null}
          </ul>
        </section>
      </div>

      {/* Top-selling + quick actions */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <section className="space-y-3 lg:col-span-2">
          <p className="eyebrow">Top-selling products (30 days)</p>
          <ul className="divide-y divide-border border border-border bg-card">
            {topList.map((p) => (
              <li key={p.id} className="flex items-center gap-4 p-4">
                <div className="h-14 w-14 shrink-0 overflow-hidden bg-muted">
                  {p.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={publicImageUrl(p.image_url, 'product-images')} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.quantity} sold · {formatCurrency(p.revenue, { currency: p.currency })}
                  </p>
                </div>
                <StatusBadge variant="in_stock" className="!text-[0.6rem]">
                  {formatNumber(p.quantity)} units
                </StatusBadge>
              </li>
            ))}
            {topList.length === 0 ? (
              <li className="px-6 py-8 text-center text-sm text-muted-foreground">
                No paid orders in the last 30 days.
              </li>
            ) : null}
          </ul>
        </section>

        <section className="space-y-3">
          <p className="eyebrow">Quick actions</p>
          <ul className="space-y-2">
            <QuickAction href="/admin/products/new" icon={PlusCircle} label="Add a new product" />
            <QuickAction href="/admin/collections/new" icon={Tag} label="Curate a new collection" />
            <QuickAction href="/admin/inventory" icon={Package} label="Adjust inventory" />
            <QuickAction href="/admin/discounts/new" icon={Wallet} label="Create a discount code" />
          </ul>
          <div className="border border-border bg-card p-4 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">{formatNumber(productCount ?? 0)}</p>
            <p>active products in the catalogue.</p>
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value, helper }: { label: string; value: string; helper?: string }) {
  return (
    <div className="border border-border bg-card p-4">
      <p className="eyebrow text-muted-foreground">{label}</p>
      <p className="mt-1 font-serif text-2xl tracking-tight">{value}</p>
      {helper ? <p className="mt-1 text-[0.65rem] text-muted-foreground">{helper}</p> : null}
    </div>
  );
}

function OrderRowItem({ order }: { order: OrderRow }) {
  return (
    <li className="px-4 py-3">
      <Link href={`/admin/orders/${order.id}`} className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-mono text-xs">{order.order_number}</p>
          <p className="truncate text-sm">{order.customer_full_name ?? order.customer_email}</p>
          <p className="text-[0.7rem] text-muted-foreground">{formatDate(order.placed_at, { dateStyle: 'medium' })}</p>
        </div>
        <div className="text-right text-sm">
          <p className="font-medium">{formatCurrency(order.total_cents, { currency: order.currency })}</p>
          <StatusBadge variant={order.status} className="!text-[0.6rem]">
            {order.status.replace('_', ' ')}
          </StatusBadge>
        </div>
      </Link>
    </li>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-center gap-3 border border-border bg-card px-4 py-3 text-sm transition-colors hover:bg-muted"
      >
        <Icon className="h-4 w-4 text-muted-foreground" />
        {label}
      </Link>
    </li>
  );
}
