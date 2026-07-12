import { EmptyState } from '@/components/ui/empty-state';
import { Package, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/session';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Order History | FASHION & CO.' };

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  processing:     { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Processing' },
  paid:           { bg: 'bg-blue-100',  text: 'text-blue-800',  label: 'Paid' },
  shipped:        { bg: 'bg-purple-100',text: 'text-purple-800',label: 'Shipped' },
  delivered:      { bg: 'bg-green-100', text: 'text-green-800', label: 'Delivered' },
  pending_payment:{ bg: 'bg-gray-100',  text: 'text-gray-700',  label: 'Pending' },
  cancelled:      { bg: 'bg-red-100',   text: 'text-red-800',   label: 'Cancelled' },
};

export default async function OrdersPage() {
  const session = await getSession();
  const supabase = await createSupabaseServerClient();
  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, status, placed_at, total_cents, currency')
    .eq('user_id', session?.user.id ?? '')
    .order('placed_at', { ascending: false });

  const list = orders ?? [];
  const formatPrice = (cents: number, currency: string) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency, minimumFractionDigits: 0 }).format(cents / 100);
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="bg-[#fef8fc] font-montserrat min-h-screen">
      {/* Sub-header */}
      <div className="bg-[#430562] text-white px-6 md:px-12 py-10">
        <div className="max-w-5xl mx-auto">
          <Link href="/account" className="text-white/60 text-[12px] uppercase tracking-wider hover:text-white transition-colors">
            ← Back to Account
          </Link>
          <h1 className="font-playfair text-[36px] font-bold mt-4">Order History</h1>
          <p className="text-white/60 text-[14px] mt-1">
            {list.length} {list.length === 1 ? 'order' : 'orders'} placed
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-12 py-12">
        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-[#f2ecf0] flex items-center justify-center mb-6">
              <Package className="w-8 h-8 text-[#cfc2d1]" />
            </div>
            <h2 className="font-playfair text-[28px] font-semibold text-[#1d1b1e] mb-3">No Orders Yet</h2>
            <p className="text-[#4d444f] text-[14px] mb-8 max-w-sm">
              Once our collections open, your orders will appear here.
            </p>
            <Link
              href="/collections/shop"
              className="bg-[#430562] text-white px-8 py-4 font-montserrat text-[14px] font-semibold uppercase tracking-wider hover:bg-[#3d174f] transition-colors"
            >
              Browse the Edit
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {list.map((o) => {
              const status = STATUS_STYLES[o.status] ?? { bg: 'bg-gray-100', text: 'text-gray-700', label: o.status };
              return (
                <Link
                  key={o.id}
                  href={`/account/orders/${o.id}`}
                  className="flex items-center justify-between bg-white border border-[#cfc2d1]/30 p-6 hover:border-[#430562]/30 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-[#f2ecf0] flex items-center justify-center shrink-0">
                      <Package className="w-6 h-6 text-[#430562]" />
                    </div>
                    <div>
                      <p className="font-montserrat text-[14px] font-semibold text-[#1d1b1e]">
                        Order #{o.order_number}
                      </p>
                      <p className="font-montserrat text-[12px] text-[#7e7480] mt-1">
                        {formatDate(o.placed_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className={`hidden sm:inline-flex px-3 py-1 font-montserrat text-[11px] uppercase tracking-wider ${status.bg} ${status.text}`}>
                      {status.label}
                    </span>
                    <p className="font-montserrat text-[14px] font-medium text-[#1d1b1e]">
                      {formatPrice(o.total_cents, o.currency)}
                    </p>
                    <ChevronRight className="w-5 h-5 text-[#cfc2d1] group-hover:text-[#430562] transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
