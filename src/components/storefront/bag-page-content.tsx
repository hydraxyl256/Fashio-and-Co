'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from '@/lib/auth/session-client';
import { useCartStore } from '@/lib/store/cart-store';
import { publicImageUrl } from '@/lib/queries/catalogue-types';
import { UpdateCartLine } from '@/components/storefront/cart-line-controls';

export function BagPageContent() {
  const session = useSession();
  const cart = useCartStore((s) => s.cart);

  const formatPrice = (cents: number, currency: string) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency, minimumFractionDigits: 0 }).format(cents / 100);

  if (!cart || cart.items.length === 0) {
    return (
      <div className="bg-[#fef8fc] min-h-screen pt-16 pb-32 flex flex-col items-center justify-center font-montserrat">
        <div className="max-w-md text-center px-5">
          <h1 className="font-playfair text-[40px] font-bold text-[#430562] mb-4">Your Bag is Empty</h1>
          <p className="text-[#4d444f] text-[16px] leading-[24px] mb-8">
            Begin with a single piece — a silk slip dress, a signature cuff, or an artisan-crafted necklace.
          </p>
          <Link 
            href="/collections/shop" 
            className="inline-block bg-[#430562] text-white px-8 py-4 text-[14px] font-semibold uppercase tracking-[0.1em] hover:bg-[#3d174f] transition-colors"
          >
            Browse the Collection
          </Link>

          {!session && (
            <p className="mt-8 text-[14px] text-[#7e7480]">
              <Link href="/sign-in" className="text-[#430562] font-medium border-b border-[#430562] pb-0.5 hover:opacity-70">
                Sign in
              </Link>{' '}
              to see bags saved across devices.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fef8fc] min-h-screen font-montserrat text-[#1d1b1e]">
      <div className="px-5 sm:px-10 lg:px-[80px] max-w-[1440px] mx-auto pt-16 pb-[120px]">
        
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-playfair text-[40px] md:text-[48px] font-bold leading-[1.1] text-[#430562] mb-2">
            Your Shopping Bag
          </h1>
          <p className="text-[16px] text-[#4d444f]">
            {cart.itemCount} {cart.itemCount === 1 ? 'piece' : 'pieces'} reserved for you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left: Cart Items (8 cols) */}
          <div className="lg:col-span-8">
            <div className="border-t border-[#cfc2d1]/50">
              {cart.items.map((item) => {
                const img = item.imagePath ? publicImageUrl(item.imagePath) : null;
                const price = formatPrice(item.lineTotalCents, item.currency);
                
                return (
                  <div key={item.id} className="py-8 border-b border-[#cfc2d1]/50 flex gap-6 sm:gap-8">
                    {/* Image */}
                    <Link
                      href={item.productSlug ? `/products/${item.productSlug}` : '#'}
                      className="flex-shrink-0 w-[120px] sm:w-[160px] aspect-[4/5] bg-[#f2ecf0] block relative overflow-hidden group"
                    >
                      {img && (
                        <Image
                          src={img}
                          alt={item.productName}
                          fill
                          sizes="(min-width: 640px) 160px, 120px"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                    </Link>

                    {/* Details */}
                    <div className="flex flex-col flex-1">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <Link
                            href={item.productSlug ? `/products/${item.productSlug}` : '#'}
                            className="font-montserrat text-[16px] font-semibold uppercase tracking-wider text-[#1d1b1e] hover:text-[#430562] transition-colors"
                          >
                            {item.productName}
                          </Link>
                          {item.variantTitle && (
                            <p className="text-[#4d444f] text-[14px] mt-1">{item.variantTitle}</p>
                          )}
                          <p className="text-[#7e7480] text-[14px] mt-2 font-medium">
                            {formatPrice(item.unitPriceCents, item.currency)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-auto flex items-end justify-between">
                        <UpdateCartLine 
                          itemId={item.id} 
                          quantity={item.quantity} 
                          available={item.available} 
                        />
                        <span className="font-montserrat text-[16px] font-semibold text-[#1d1b1e]">
                          {price}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Order Summary (4 cols) */}
          <div className="lg:col-span-4 sticky top-32">
            <div className="bg-white border border-[#cfc2d1]/50 p-8">
              <h2 className="font-playfair text-[24px] font-semibold text-[#430562] mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-[14px]">
                  <span className="text-[#4d444f]">Subtotal</span>
                  <span className="font-semibold text-[#1d1b1e]">{formatPrice(cart.subtotalCents, cart.currency)}</span>
                </div>
                <div className="flex justify-between text-[14px]">
                  <span className="text-[#4d444f]">Delivery</span>
                  <span className="text-[#4d444f]">Calculated at checkout</span>
                </div>
              </div>

              <div className="border-t border-[#cfc2d1]/50 pt-6 mb-8 flex justify-between">
                <span className="font-semibold text-[16px] uppercase tracking-wider text-[#1d1b1e]">Total</span>
                <span className="font-bold text-[20px] text-[#1d1b1e]">{formatPrice(cart.subtotalCents, cart.currency)}</span>
              </div>

              <Link 
                href="/checkout"
                className="block w-full bg-[#430562] text-white text-center py-4 text-[14px] font-semibold uppercase tracking-wider hover:bg-[#3d174f] transition-colors"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
