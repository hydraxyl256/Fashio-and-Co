'use client';

import * as React from 'react';
import Link from 'next/link';
import { Heart, Package, MapPin, User, Settings, ChevronRight } from 'lucide-react';
import { signOutAction } from '@/app/(auth)/actions';

interface AccountOverviewClientProps {
  profile: {
    full_name: string | null;
    email: string;
    phone: string | null;
  } | null;
  recentOrders: Array<{
    id: string;
    order_number: string;
    status: string;
    placed_at: string;
    total_cents: number;
    currency: string;
  }>;
  wishlistCount: number;
}

const STATUS_STYLES: Record<string, string> = {
  processing: 'bg-amber-100 text-amber-800',
  paid: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  pending_payment: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

export function AccountOverviewClient({
  profile,
  recentOrders,
  wishlistCount,
}: AccountOverviewClientProps) {
  const firstName = profile?.full_name?.split(' ')[0] ?? 'Member';
  const mostRecentOrder = recentOrders[0];

  const formatPrice = (cents: number, currency: string) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency, minimumFractionDigits: 0 }).format(cents / 100);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="bg-[#fef8fc] min-h-screen font-montserrat text-[#1d1b1e]">
      {/* Account Header */}
      <div className="bg-[#430562] text-white px-6 md:px-12 py-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <p className="font-montserrat text-[12px] uppercase tracking-[0.15em] text-white/60 mb-2">My Account</p>
            <h1 className="font-playfair text-[40px] md:text-[48px] font-bold">
              Hello, {firstName}.
            </h1>
            {profile?.email && (
              <p className="text-white/60 text-[14px] mt-1">{profile.email}</p>
            )}
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              className="border border-white/30 text-white px-6 py-3 font-montserrat text-[12px] uppercase tracking-wider hover:bg-white/10 transition-colors"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="grid grid-cols-12 gap-6">
          
          {/* Recent Order - Large Card */}
          {mostRecentOrder ? (
            <div className="col-span-12 lg:col-span-8 bg-white border border-[#cfc2d1]/30 overflow-hidden group">
              <div className="flex flex-col md:flex-row h-full">
                <div className="md:w-1/3 h-48 md:h-auto relative overflow-hidden bg-[#f2ecf0] flex items-center justify-center">
                  <Package className="w-12 h-12 text-[#cfc2d1]" />
                  <div
                    className={`absolute top-4 left-4 px-3 py-1 font-montserrat text-[12px] font-semibold uppercase tracking-wider ${
                      STATUS_STYLES[mostRecentOrder.status] ?? 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {mostRecentOrder.status.replace('_', ' ')}
                  </div>
                </div>
                <div className="md:w-2/3 p-8 flex flex-col justify-between">
                  <div>
                    <p className="font-montserrat text-[12px] uppercase tracking-wider text-[#7e7480] mb-2">
                      Last Ordered {formatDate(mostRecentOrder.placed_at)}
                    </p>
                    <h2 className="font-playfair text-[28px] font-semibold text-[#430562] mb-4">
                      Order #{mostRecentOrder.order_number}
                    </h2>
                    <p className="text-[#4d444f] text-[16px]">
                      Total: {formatPrice(mostRecentOrder.total_cents, mostRecentOrder.currency)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t border-[#cfc2d1]/30 pt-6 mt-6">
                    <p className="text-[14px] text-[#4d444f]">Track your shipment</p>
                    <Link
                      href={`/account/orders/${mostRecentOrder.id}`}
                      className="font-montserrat text-[14px] font-semibold text-[#430562] hover:underline uppercase tracking-wider"
                    >
                      View Order →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="col-span-12 lg:col-span-8 bg-white border border-[#cfc2d1]/30 p-10 flex flex-col items-center justify-center text-center min-h-[200px]">
              <Package className="w-10 h-10 text-[#cfc2d1] mb-4" />
              <h2 className="font-playfair text-[24px] font-semibold text-[#1d1b1e] mb-2">No Orders Yet</h2>
              <p className="text-[#4d444f] text-[14px] mb-6">Your order history will appear here once you make your first purchase.</p>
              <Link
                href="/collections/shop"
                className="bg-[#430562] text-white px-8 py-3 font-montserrat text-[12px] uppercase tracking-wider hover:bg-[#3d174f] transition-colors"
              >
                Browse the Edit
              </Link>
            </div>
          )}

          {/* Wishlist Tile */}
          <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-[#430562] text-white p-8 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <Heart className="w-10 h-10 text-white/60" fill="currentColor" />
              <div className="text-right">
                <span className="font-playfair text-[56px] font-bold leading-none block">{wishlistCount}</span>
                <span className="font-montserrat text-[12px] uppercase tracking-wider text-white/60">Items Saved</span>
              </div>
            </div>
            <div>
              <h3 className="font-playfair text-[24px] font-semibold mb-2">Wishlist</h3>
              <p className="text-white/70 text-[14px] mb-6">Don't let them slip away. Your curated favorites are waiting.</p>
              <Link
                href="/account/wishlist"
                className="block w-full py-3 bg-white text-[#430562] font-montserrat text-[12px] font-semibold uppercase tracking-wider text-center hover:bg-[#f2ecf0] transition-colors"
              >
                View Wishlist
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-white border border-[#cfc2d1]/30 p-8">
            <h3 className="font-playfair text-[24px] font-semibold text-[#430562] mb-6">Quick Links</h3>
            <div className="space-y-1">
              {[
                { href: '/account/orders', icon: Package, label: 'Order History' },
                { href: '/account/addresses', icon: MapPin, label: 'Address Book' },
                { href: '/account/profile', icon: Settings, label: 'Profile Settings' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-between py-3 border-b border-[#cfc2d1]/30 last:border-b-0 text-[#4d444f] hover:text-[#430562] transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span className="font-montserrat text-[14px]">{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Profile Quick View */}
          <div className="col-span-12 lg:col-span-8 bg-[#f2ecf0] border border-[#cfc2d1]/30 p-8 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-[#e6b4ff] rounded-full flex items-center justify-center border-2 border-[#430562]">
                <User className="w-8 h-8 text-[#430562]" />
              </div>
              <div>
                <h3 className="font-playfair text-[20px] font-semibold text-[#430562]">
                  {profile?.full_name ?? 'Your Profile'}
                </h3>
                <p className="text-[#4d444f] text-[14px]">
                  {profile?.email ?? ''}
                  {profile?.phone ? ` · ${profile.phone}` : ''}
                </p>
              </div>
            </div>
            <Link
              href="/account/profile"
              className="shrink-0 px-6 py-3 border border-[#430562] text-[#430562] font-montserrat text-[12px] font-semibold uppercase tracking-wider hover:bg-[#430562] hover:text-white transition-all"
            >
              Edit Profile
            </Link>
          </div>

          {/* Order History List */}
          {recentOrders.length > 0 && (
            <div className="col-span-12 bg-white border border-[#cfc2d1]/30">
              <div className="flex items-center justify-between px-8 py-6 border-b border-[#cfc2d1]/30">
                <h3 className="font-playfair text-[24px] font-semibold text-[#430562]">Recent Orders</h3>
                <Link href="/account/orders" className="font-montserrat text-[14px] text-[#430562] hover:underline">
                  View All →
                </Link>
              </div>
              <div className="divide-y divide-[#cfc2d1]/30">
                {recentOrders.slice(0, 3).map((order) => (
                  <div key={order.id} className="flex items-center justify-between px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#f2ecf0] flex items-center justify-center">
                        <Package className="w-5 h-5 text-[#430562]" />
                      </div>
                      <div>
                        <p className="font-montserrat text-[14px] font-semibold text-[#1d1b1e]">#{order.order_number}</p>
                        <p className="font-montserrat text-[12px] text-[#7e7480]">{formatDate(order.placed_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <span
                        className={`px-3 py-1 font-montserrat text-[11px] uppercase tracking-wider ${
                          STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {order.status.replace('_', ' ')}
                      </span>
                      <p className="font-montserrat text-[14px] font-medium text-[#1d1b1e] hidden sm:block">
                        {formatPrice(order.total_cents, order.currency)}
                      </p>
                      <Link
                        href={`/account/orders/${order.id}`}
                        className="text-[#430562] hover:underline font-montserrat text-[12px] uppercase tracking-wider"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
