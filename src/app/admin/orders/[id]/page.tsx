import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { requireStaffOrAdmin } from '@/lib/auth/session';
import { getAdminOrderDetail } from '@/lib/admin/queries/orders';
import { formatCurrency, formatDate, formatNumber } from '@/lib/format';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { StatusBadge } from '@/components/admin/status-badge';
import { statusLabel } from '@/lib/admin/state-machine';
import { StatusUpdater } from './status-updater';
import { InternalNoteEditor } from './internal-note-editor';
import { updateOrderInternalNoteAction, updateOrderStatusAction } from '@/lib/admin/actions/orders';

export const metadata = { title: 'Admin · Order' };
export const dynamic = 'force-dynamic';

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaffOrAdmin('/admin/orders');
  const { id } = await params;
  const detail = await getAdminOrderDetail(id);
  if (!detail) notFound();
  const { order, items, payments, history } = detail;
  const latestPayment = payments[0] ?? null;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1 text-eyebrow uppercase text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> All orders
        </Link>
      </div>

      <AdminPageHeader
        eyebrow={`Order ${order.order_number}`}
        title={order.customer_full_name ?? order.customer_email}
        description={`Placed ${formatDate(order.placed_at, { dateStyle: 'long' })} · ${order.currency}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge variant={order.status}>{statusLabel(order.status)}</StatusBadge>
            {latestPayment ? (
              <StatusBadge variant={latestPayment.status}>{latestPayment.status}</StatusBadge>
            ) : null}
            <span className="font-serif text-2xl">
              {formatCurrency(order.total_cents, { currency: order.currency })}
            </span>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="space-y-2 lg:col-span-2">
          <p className="eyebrow">Items</p>
          <div className="border border-border bg-card">
            <ul className="divide-y divide-border">
              {items.map((item) => (
                <li key={item.id} className="flex items-start gap-4 p-4">
                  <div className="h-16 w-16 shrink-0 bg-muted">
                    {item.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image_url} alt="" className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-medium">{item.product_name}</p>
                    {item.variant_title ? <p className="text-muted-foreground">{item.variant_title}</p> : null}
                    {item.sku ? <p className="text-xs font-mono text-muted-foreground">{item.sku}</p> : null}
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(item.quantity)} ×{' '}
                      {formatCurrency(item.unit_price_cents, { currency: item.currency })}
                    </p>
                  </div>
                  <p className="text-sm font-medium">
                    {formatCurrency(item.line_total_cents, { currency: item.currency })}
                  </p>
                </li>
              ))}
              {items.length === 0 ? (
                <li className="p-6 text-center text-sm text-muted-foreground">No items on this order.</li>
              ) : null}
            </ul>
            <div className="grid grid-cols-2 gap-2 border-t border-border bg-muted/30 p-4 text-sm">
              <p className="text-muted-foreground">Subtotal</p>
              <p className="text-right">{formatCurrency(order.subtotal_cents, { currency: order.currency })}</p>
              <p className="text-muted-foreground">Discount</p>
              <p className="text-right">−{formatCurrency(order.discount_cents, { currency: order.currency })}</p>
              <p className="text-muted-foreground">Delivery</p>
              <p className="text-right">{formatCurrency(order.shipping_cents, { currency: order.currency })}</p>
              <p className="text-muted-foreground">Tax</p>
              <p className="text-right">{formatCurrency(order.tax_cents, { currency: order.currency })}</p>
              <p className="border-t border-border pt-2 font-medium">Total</p>
              <p className="border-t border-border pt-2 text-right font-medium">
                {formatCurrency(order.total_cents, { currency: order.currency })}
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <p className="eyebrow">Customer</p>
          <div className="border border-border bg-card p-4 text-sm">
            <p className="font-medium">{order.customer_full_name ?? '—'}</p>
            <p className="text-muted-foreground">{order.customer_email}</p>
            {order.customer_phone ? <p className="text-muted-foreground">{order.customer_phone}</p> : null}
          </div>

          <p className="eyebrow">Shipping</p>
          <div className="border border-border bg-card p-4 text-sm">
            <p>{order.shipping_recipient_name}</p>
            <p>{order.shipping_line1}</p>
            {order.shipping_line2 ? <p>{order.shipping_line2}</p> : null}
            <p>
              {order.shipping_city}
              {order.shipping_region ? `, ${order.shipping_region}` : ''}
            </p>
            <p>{order.shipping_country}</p>
            <p className="mt-1 text-muted-foreground">{order.shipping_phone}</p>
          </div>

          <p className="eyebrow">Delivery</p>
          <div className="border border-border bg-card p-4 text-sm">
            <p className="font-medium">
              {order.delivery_zone_name ?? '—'}
              {order.delivery_rate_name ? ` · ${order.delivery_rate_name}` : ''}
            </p>
            <p className="text-muted-foreground">
              {formatCurrency(order.delivery_price_cents, { currency: order.currency })}
            </p>
          </div>

          {order.applied_discount_code ? (
            <>
              <p className="eyebrow">Discount applied</p>
              <div className="border border-border bg-card p-4 text-sm">
                <p className="font-mono text-xs">{order.applied_discount_code}</p>
                <p className="text-muted-foreground">
                  −{formatCurrency(order.discount_cents, { currency: order.currency })}
                </p>
              </div>
            </>
          ) : null}
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="space-y-3">
          <p className="eyebrow">Payments</p>
          <div className="border border-border bg-card">
            {payments.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No payment attempts yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {payments.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 p-3 text-sm">
                    <div>
                      <p className="font-medium">{p.provider}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.method ? `${p.method} · ` : ''}
                        {p.provider_reference ?? p.id}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(p.amount_cents, { currency: p.currency })}
                      </p>
                      <StatusBadge variant={p.status}>{p.status}</StatusBadge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="space-y-3">
          <p className="eyebrow">Status history</p>
          <ol className="border border-border bg-card">
            {history.length === 0 ? (
              <li className="p-4 text-sm text-muted-foreground">No transitions yet.</li>
            ) : null}
            {history.map((h) => (
              <li key={h.id} className="border-b border-border p-3 text-sm last:border-b-0">
                <div className="flex flex-wrap items-center gap-2">
                  {h.from_status ? (
                    <StatusBadge variant={h.from_status}>{statusLabel(h.from_status)}</StatusBadge>
                  ) : (
                    <span className="text-eyebrow uppercase text-muted-foreground">Created</span>
                  )}
                  <span className="text-muted-foreground">→</span>
                  <StatusBadge variant={h.to_status}>{statusLabel(h.to_status)}</StatusBadge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDate(h.created_at, { dateStyle: 'medium', timeStyle: 'short' })}
                  {h.note ? ` — ${h.note}` : ''}
                </p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-2">
          <p className="eyebrow">Update status</p>
          <StatusUpdater
            orderId={order.id}
            current={order.status}
            updateAction={updateOrderStatusAction}
          />
        </div>
        <div className="space-y-2">
          <p className="eyebrow">Internal note</p>
          <div className="border border-border bg-card p-4">
            <InternalNoteEditor
              orderId={order.id}
              initialNote={order.internal_note}
              updateAction={updateOrderInternalNoteAction}
            />
          </div>
          {order.customer_note ? (
            <p className="text-xs text-muted-foreground">Customer left a note: “{order.customer_note}”</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
