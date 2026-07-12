import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Package, MapPin, CreditCard, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/session';

export const metadata: Metadata = { title: 'Order Detail | FASHION & CO.' };

const STATUS_STEPS = ['pending_payment', 'paid', 'processing', 'shipped', 'delivered'];
const STATUS_LABELS: Record<string, string> = {
  pending_payment: 'Pending',
  paid: 'Paid',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  returned: 'Returned',
};

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) notFound();

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('orders')
    .select(`
      id, order_number, status, placed_at, total_cents, currency,
      subtotal_cents, shipping_cents, discount_cents,
      line_items:order_line_items (
        id, product_name, variant_title, quantity, unit_price_cents, currency
      ),
      shipping_address:addresses (
        recipient_name, line1, line2, city, region, postal_code, country
      )
    `)
    .eq('id', id)
    .eq('user_id', session.user.id)
    .single();

  const order = data as any;

  if (!order) notFound();

  const formatPrice = (cents: number, currency: string) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency, minimumFractionDigits: 0 }).format(cents / 100);
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' });

  const currentStep = STATUS_STEPS.indexOf(order.status);
  const lineItems = (order.line_items as unknown) as Array<{
    id: string; product_name: string; variant_title: string | null; quantity: number; unit_price_cents: number; currency: string;
  }>;
  const address = (order.shipping_address as unknown) as {
    recipient_name: string; line1: string; line2: string | null; city: string; region: string | null; country: string;
  } | null;

  return (
    <div className="bg-[#fef8fc] font-montserrat min-h-screen">
      {/* Sub-header */}
      <div className="bg-[#430562] text-white px-6 md:px-12 py-10">
        <div className="max-w-5xl mx-auto">
          <Link href="/account/orders" className="flex items-center gap-2 text-white/60 text-[12px] uppercase tracking-wider hover:text-white transition-colors mb-4">
            <ArrowLeft className="w-3 h-3" />
            Order History
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-playfair text-[36px] font-bold">Order #{order.order_number}</h1>
              <p className="text-white/60 text-[14px] mt-1">Placed {formatDate(order.placed_at)}</p>
            </div>
            <span className="inline-flex px-4 py-2 bg-white/10 text-white font-montserrat text-[12px] uppercase tracking-wider border border-white/20">
              {STATUS_LABELS[order.status] ?? order.status}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-12 py-12 space-y-8">
        
        {/* Tracking Progress */}
        {currentStep >= 0 && (
          <div className="bg-white border border-[#cfc2d1]/30 p-8">
            <h2 className="font-playfair text-[22px] font-semibold text-[#430562] mb-8">Order Status</h2>
            <div className="relative">
              <div className="absolute top-6 left-0 right-0 h-0.5 bg-[#cfc2d1]" />
              <div
                className="absolute top-6 left-0 h-0.5 bg-[#430562] transition-all"
                style={{ width: `${Math.min(100, (currentStep / (STATUS_STEPS.length - 1)) * 100)}%` }}
              />
              <div className="relative flex justify-between">
                {STATUS_STEPS.map((step, idx) => {
                  const done = idx <= currentStep;
                  return (
                    <div key={step} className="flex flex-col items-center gap-3">
                      <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center z-10 transition-colors ${
                        done ? 'bg-[#430562] border-[#430562]' : 'bg-white border-[#cfc2d1]'
                      }`}>
                        {done ? (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M3 8L7 12L13 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : (
                          <div className="w-3 h-3 rounded-full bg-[#cfc2d1]" />
                        )}
                      </div>
                      <p className={`font-montserrat text-[11px] uppercase tracking-wider text-center ${done ? 'text-[#430562] font-semibold' : 'text-[#7e7480]'}`}>
                        {STATUS_LABELS[step]}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Line Items */}
          <div className="lg:col-span-2 bg-white border border-[#cfc2d1]/30">
            <div className="px-8 py-6 border-b border-[#cfc2d1]/30">
              <h2 className="font-playfair text-[22px] font-semibold text-[#430562]">Items Ordered</h2>
            </div>
            <div className="divide-y divide-[#cfc2d1]/30">
              {lineItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#f2ecf0] flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5 text-[#430562]" />
                    </div>
                    <div>
                      <p className="font-montserrat text-[14px] font-semibold text-[#1d1b1e]">{item.product_name}</p>
                      {item.variant_title && (
                        <p className="font-montserrat text-[12px] text-[#7e7480] mt-0.5">{item.variant_title}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-montserrat text-[14px] font-medium text-[#1d1b1e]">
                      {formatPrice(item.unit_price_cents * item.quantity, item.currency)}
                    </p>
                    <p className="font-montserrat text-[12px] text-[#7e7480]">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Totals */}
            <div className="bg-white border border-[#cfc2d1]/30 p-6">
              <h3 className="font-playfair text-[18px] font-semibold text-[#430562] mb-4">Order Summary</h3>
              <div className="space-y-3 font-montserrat text-[14px]">
                <div className="flex justify-between text-[#4d444f]">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal_cents, order.currency)}</span>
                </div>
                {order.shipping_cents > 0 && (
                  <div className="flex justify-between text-[#4d444f]">
                    <span>Shipping</span>
                    <span>{formatPrice(order.shipping_cents, order.currency)}</span>
                  </div>
                )}
                {order.discount_cents > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Discount</span>
                    <span>-{formatPrice(order.discount_cents, order.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-[#1d1b1e] pt-3 border-t border-[#cfc2d1]/30 text-[16px]">
                  <span>Total</span>
                  <span>{formatPrice(order.total_cents, order.currency)}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {address && (
              <div className="bg-white border border-[#cfc2d1]/30 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="w-4 h-4 text-[#430562]" />
                  <h3 className="font-playfair text-[18px] font-semibold text-[#430562]">Delivery Address</h3>
                </div>
                <div className="font-montserrat text-[14px] text-[#4d444f] space-y-1">
                  <p className="font-semibold text-[#1d1b1e]">{address.recipient_name}</p>
                  <p>{address.line1}</p>
                  {address.line2 && <p>{address.line2}</p>}
                  <p>{address.city}{address.region ? `, ${address.region}` : ''}</p>
                  <p>{address.country}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <Link
            href="/account/orders"
            className="border border-[#430562] text-[#430562] px-8 py-4 font-montserrat text-[14px] font-semibold uppercase tracking-wider hover:bg-[#430562] hover:text-white transition-all"
          >
            Back to Orders
          </Link>
          <Link
            href="/contact"
            className="bg-[#f2ecf0] text-[#430562] px-8 py-4 font-montserrat text-[14px] font-semibold uppercase tracking-wider hover:bg-[#e7e1e5] transition-all"
          >
            Need Help?
          </Link>
        </div>
      </div>
    </div>
  );
}
