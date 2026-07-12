import { Suspense } from 'react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Check, Truck } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Order Confirmation | FASHION & CO.' };

interface Props {
  searchParams: Promise<{ orderId?: string }>;
}

async function OrderDetails({ orderNumber }: { orderNumber: string }) {
  const supabase = await createSupabaseServerClient();
  const { data: _order } = await supabase
    .from('orders')
    .select(
      `
      id, order_number, customer_email, shipping_recipient_name, shipping_line1, shipping_city,
      total_cents, subtotal_cents, shipping_cents, status, delivery_rate_name,
      order_items (id, product_name, quantity, unit_price_cents, line_total_cents, image_url, variant_title)
    `
    )
    .eq('order_number', orderNumber)
    .single();

  const order = _order as any;

  if (!order) {
    return (
      <div className="bg-[#fef8fc] border border-[#cfc2d1]/30 p-12 text-center max-w-2xl mx-auto mt-12">
        <h3 className="font-playfair text-[24px] font-semibold text-[#430562] mb-2">Order Not Found</h3>
        <p className="font-montserrat text-[14px] text-[#4d444f]">
          We couldn't locate this order. Please check your email for confirmation.
        </p>
      </div>
    );
  }

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(cents / 100);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-[#f8f2f6] rounded-xl p-6 border border-[#cfc2d1]/30">
        <h3 className="font-montserrat text-[12px] uppercase tracking-wider text-[#430562] mb-4 font-semibold">Summary</h3>
        <div className="space-y-4">
          {order.order_items.map((item: any) => (
            <div key={item.id} className="flex gap-4">
              <div className="w-20 h-24 bg-[#ece6eb] rounded overflow-hidden flex-shrink-0">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#cfc2d1]/30" />
                )}
              </div>
              <div className="flex flex-col justify-between py-1 flex-grow">
                <div>
                  <p className="font-playfair text-[18px] text-[#1d1b1e] font-semibold leading-tight">{item.product_name}</p>
                  <p className="font-montserrat text-[12px] text-[#4d444f] mt-1">{item.variant_title || 'One Size'}</p>
                </div>
                <p className="font-montserrat text-[14px] font-semibold text-[#430562]">{formatPrice(item.line_total_cents)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-[#cfc2d1]/50 space-y-2">
          <div className="flex justify-between font-montserrat text-[14px] text-[#4d444f]">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal_cents)}</span>
          </div>
          <div className="flex justify-between font-montserrat text-[14px] text-[#4d444f]">
            <span>Shipping</span>
            <span>{order.shipping_cents === 0 ? 'Free' : formatPrice(order.shipping_cents)}</span>
          </div>
          <div className="flex justify-between font-montserrat text-[18px] font-bold text-[#430562] pt-2">
            <span>Total Paid</span>
            <span>{formatPrice(order.total_cents)}</span>
          </div>
        </div>
      </div>

      <div className="bg-[#f8f2f6] rounded-xl p-6 border border-[#cfc2d1]/30 grid grid-cols-2 gap-6">
        <div className="col-span-2">
          <h3 className="font-montserrat text-[12px] uppercase tracking-wider text-[#430562] mb-2 font-semibold">Delivery Details</h3>
        </div>
        <div>
          <p className="font-montserrat text-[10px] text-[#4d444f] uppercase tracking-tighter mb-1">Estimated Delivery</p>
          <p className="font-montserrat text-[14px] text-[#1d1b1e] font-medium">3-5 Business Days</p>
        </div>
        <div>
          <p className="font-montserrat text-[10px] text-[#4d444f] uppercase tracking-tighter mb-1">Shipping Method</p>
          <p className="font-montserrat text-[14px] text-[#1d1b1e] font-medium">{order.delivery_rate_name || 'Standard Courier'}</p>
        </div>
        <div className="col-span-2">
          <p className="font-montserrat text-[10px] text-[#4d444f] uppercase tracking-tighter mb-1">Address</p>
          <p className="font-montserrat text-[14px] text-[#1d1b1e]">
            {order.shipping_line1}<br />
            {order.shipping_city}
          </p>
        </div>
      </div>

      <div className="pt-8 space-y-4 flex flex-col items-center">
        <Link
          href={`/account/orders/${order.id}`}
          className="w-full sm:w-auto min-w-[280px] bg-[#430562] text-white py-4 font-montserrat text-[14px] uppercase tracking-widest hover:bg-[#3d174f] transition-all duration-300 shadow-xl shadow-[#430562]/20 flex items-center justify-center gap-2"
        >
          Track Order
          <Truck className="w-5 h-5 ml-2" />
        </Link>
        <Link
          href="/collections/shop"
          className="inline-block py-2 text-[#430562] font-montserrat text-[14px] font-semibold border-b-2 border-[#430562] hover:border-transparent transition-all duration-200"
        >
          Return to Shop
        </Link>
      </div>
    </div>
  );
}

export default async function OrderConfirmationPage(props: Props) {
  const searchParams = await props.searchParams;
  const orderId = searchParams.orderId;

  return (
    <div className="min-h-screen bg-[#fef8fc] -mt-12 py-12">
      {/* Hero */}
      <div className="flex flex-col items-center text-center space-y-4 mb-16 mt-8">
        <div className="w-20 h-20 rounded-full bg-[#fdd589] flex items-center justify-center mb-2 animate-bounce shadow-xl shadow-[#fdd589]/30">
          <Check className="w-10 h-10 text-[#775a1a]" strokeWidth={3} />
        </div>
        <h2 className="font-playfair text-[36px] sm:text-[48px] text-[#430562] font-bold">Thank you for your order.</h2>
        <p className="font-montserrat text-[16px] text-[#4d444f] px-4 max-w-lg">
          Your request has been received and is being prepared with elegance in our Nairobi studio.
        </p>
        
        {orderId && (
          <div className="pt-4">
            <span className="font-montserrat text-[12px] font-semibold text-[#4d444f] uppercase tracking-widest block mb-1">Order Number</span>
            <p className="font-playfair text-[32px] text-[#430562] font-bold tracking-tight">#{orderId}</p>
          </div>
        )}
      </div>

      <div className="px-6 md:px-20 max-w-[1440px] mx-auto">
        {orderId ? (
          <Suspense fallback={<div className="text-center py-20 animate-pulse text-[#430562]">Loading your order details...</div>}>
            <OrderDetails orderNumber={orderId} />
          </Suspense>
        ) : (
          <div className="bg-[#f8f2f6] border border-[#cfc2d1]/30 p-12 text-center max-w-2xl mx-auto rounded-xl">
            <h3 className="font-playfair text-[24px] font-semibold text-[#430562] mb-4">No Order Specified</h3>
            <p className="font-montserrat text-[14px] text-[#4d444f] mb-8">
              We couldn't locate the order number. Please check your email for the confirmation details.
            </p>
            <Link
              href="/collections/shop"
              className="bg-[#430562] text-white py-4 px-12 font-montserrat text-[14px] uppercase tracking-widest hover:bg-[#3d174f] transition-all"
            >
              Continue Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
