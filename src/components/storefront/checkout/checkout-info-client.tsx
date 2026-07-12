'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useCheckout } from './checkout-context';
import { ArrowRight, Lock, ShieldCheck, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/lib/store/cart-store';
import { publicImageUrl } from '@/lib/queries/catalogue-types';

interface CheckoutInfoClientProps {
  user: any;
  cartItems: any[];
}

export function CheckoutInfoClient({ user, cartItems }: CheckoutInfoClientProps) {
  const router = useRouter();
  const { data, updateData, setCartItems } = useCheckout();
  const cart = useCartStore((s) => s.cart);

  React.useEffect(() => {
    setCartItems(cartItems);
    if (user?.email && !data.email) {
      updateData({ email: user.email });
    }
  }, [user, cartItems, setCartItems, updateData, data.email]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/checkout/payment');
  };

  // Basic format price function
  const formatPrice = (cents: number) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(cents / 100);

  const items = cart?.items || [];
  const subtotal = cart?.subtotalCents || 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
      {/* Left Column: Information */}
      <div className="lg:col-span-7 space-y-12">
        <form onSubmit={handleSubmit} className="space-y-12">
          
          {/* Contact Information */}
          <section className="space-y-4">
            <div className="flex justify-between items-baseline border-b border-[#cfc2d1]/20 pb-4">
              <h2 className="font-playfair text-[24px] font-semibold text-[#1d1b1e]">Contact Information</h2>
              {!user && (
                <div className="flex items-center gap-2">
                  <span className="font-montserrat text-[16px] text-[#4d444f]">Already have an account?</span>
                  <Link href={`/sign-in?next=/checkout`} className="font-montserrat text-[14px] font-semibold text-[#430562] underline hover:opacity-80 transition-opacity">
                    Sign In
                  </Link>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="space-y-1">
                <label className="font-montserrat text-[12px] font-medium uppercase tracking-wider text-[#4d444f]">Email Address</label>
                <input
                  required
                  type="email"
                  value={data.email || ''}
                  onChange={(e) => updateData({ email: e.target.value })}
                  className="w-full bg-transparent border-b border-[#cfc2d1] py-3 font-montserrat text-[16px] focus:outline-none focus:border-[#430562] transition-colors placeholder:text-[#cfc2d1]"
                  placeholder="example@nairobi.com"
                />
              </div>
              <div className="space-y-1">
                <label className="font-montserrat text-[12px] font-medium uppercase tracking-wider text-[#4d444f]">Phone Number</label>
                <input
                  required
                  type="tel"
                  value={data.phone || ''}
                  onChange={(e) => updateData({ phone: e.target.value })}
                  className="w-full bg-transparent border-b border-[#cfc2d1] py-3 font-montserrat text-[16px] focus:outline-none focus:border-[#430562] transition-colors placeholder:text-[#cfc2d1]"
                  placeholder="+254 712 345 678"
                />
              </div>
            </div>
          </section>

          {/* Shipping Address */}
          <section className="space-y-4">
            <h2 className="font-playfair text-[24px] font-semibold text-[#1d1b1e] border-b border-[#cfc2d1]/20 pb-4">Shipping Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 pt-4">
              <div className="md:col-span-2 space-y-1">
                <label className="font-montserrat text-[12px] font-medium uppercase tracking-wider text-[#4d444f]">Full Name</label>
                <input
                  required
                  type="text"
                  value={data.fullName || ''}
                  onChange={(e) => updateData({ fullName: e.target.value, recipientName: e.target.value })}
                  className="w-full bg-transparent border-b border-[#cfc2d1] py-3 font-montserrat text-[16px] focus:outline-none focus:border-[#430562] transition-colors placeholder:text-[#cfc2d1]"
                  placeholder="Wambui Kamau"
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="font-montserrat text-[12px] font-medium uppercase tracking-wider text-[#4d444f]">Street Address / Estate</label>
                <input
                  required
                  type="text"
                  value={data.line1 || ''}
                  onChange={(e) => updateData({ line1: e.target.value })}
                  className="w-full bg-transparent border-b border-[#cfc2d1] py-3 font-montserrat text-[16px] focus:outline-none focus:border-[#430562] transition-colors placeholder:text-[#cfc2d1]"
                  placeholder="123 Muthaiga Heights, Apartment 4C"
                />
              </div>
              <div className="space-y-1">
                <label className="font-montserrat text-[12px] font-medium uppercase tracking-wider text-[#4d444f]">City / Town</label>
                <input
                  required
                  type="text"
                  value={data.city || ''}
                  onChange={(e) => updateData({ city: e.target.value })}
                  className="w-full bg-transparent border-b border-[#cfc2d1] py-3 font-montserrat text-[16px] focus:outline-none focus:border-[#430562] transition-colors placeholder:text-[#cfc2d1]"
                  placeholder="Nairobi"
                />
              </div>
              <div className="space-y-1">
                <label className="font-montserrat text-[12px] font-medium uppercase tracking-wider text-[#4d444f]">County</label>
                <select
                  required
                  value={data.region || ''}
                  onChange={(e) => updateData({ region: e.target.value })}
                  className="w-full bg-transparent border-b border-[#cfc2d1] py-3 font-montserrat text-[16px] focus:outline-none focus:border-[#430562] transition-colors appearance-none"
                >
                  <option value="">Select County</option>
                  <option value="Nairobi">Nairobi</option>
                  <option value="Mombasa">Mombasa</option>
                  <option value="Kiambu">Kiambu</option>
                  <option value="Machakos">Machakos</option>
                  <option value="Nakuru">Nakuru</option>
                </select>
              </div>
              <div className="md:col-span-2 space-y-1 pt-4">
                <label className="font-montserrat text-[12px] font-medium uppercase tracking-wider text-[#4d444f]">Delivery Instructions (Optional)</label>
                <textarea
                  rows={3}
                  value={data.line2 || ''}
                  onChange={(e) => updateData({ line2: e.target.value })}
                  className="w-full bg-transparent border-b border-[#cfc2d1] py-3 font-montserrat text-[16px] focus:outline-none focus:border-[#430562] transition-colors resize-none placeholder:text-[#cfc2d1]"
                  placeholder="Gate code, landmark, or preferred delivery time..."
                />
              </div>
            </div>
          </section>

          {/* Action Button */}
          <div className="pt-8">
            <button
              type="submit"
              className="w-full md:w-auto bg-[#430562] text-white font-montserrat text-[14px] font-semibold uppercase tracking-[0.2em] px-12 py-5 hover:bg-[#3d174f] transition-all duration-300 shadow-xl shadow-[#430562]/20 flex items-center justify-center gap-4 group"
            >
              Continue to Delivery
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
            <p className="mt-4 text-center md:text-left font-montserrat text-[12px] text-[#4d444f]">
              By proceeding, you agree to our <Link href="/privacy-terms" className="underline hover:text-[#430562]">Terms of Service</Link>.
            </p>
          </div>
        </form>
      </div>

      {/* Right Column: Sticky Order Summary */}
      <div className="lg:col-span-5 lg:sticky lg:top-32">
        <div className="bg-[#f8f2f6] border border-[#cfc2d1]/30 p-8 shadow-xl shadow-[#430562]/5 space-y-6">
          <h3 className="font-playfair text-[24px] font-semibold text-[#1d1b1e] border-b border-[#cfc2d1]/20 pb-4">Order Summary</h3>
          
          {/* Product List */}
          <div className="space-y-6 max-h-[409px] overflow-y-auto pr-2 custom-scrollbar">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="w-20 h-24 bg-[#ece6eb] overflow-hidden shrink-0">
                  {item.imagePath ? (
                    <img 
                      src={publicImageUrl(item.imagePath, 'product-images')} 
                      alt={item.productName} 
                      className="w-full h-full object-cover" 
                    />
                  ) : null}
                </div>
                <div className="flex-grow flex flex-col justify-center">
                  <p className="font-playfair text-[16px] font-semibold text-[#1d1b1e]">
                    {item.productName}
                  </p>
                  <p className="font-montserrat text-[12px] text-[#4d444f] uppercase tracking-wider mt-1">
                    {item.size || 'One Size'} | {item.color || 'Standard'}
                    {item.quantity > 1 ? ` (x${item.quantity})` : ''}
                  </p>
                  <p className="font-montserrat text-[16px] text-[#1d1b1e] mt-1">
                    {formatPrice(item.lineTotalCents)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Discount Field */}
          <div className="pt-6 border-t border-[#cfc2d1]/20">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Discount Code"
                className="w-full bg-transparent border-b border-[#cfc2d1] py-2 font-montserrat text-[14px] focus:outline-none focus:border-[#430562] transition-colors"
              />
              <button className="font-montserrat text-[14px] font-semibold uppercase text-[#430562] px-4 border border-[#430562] hover:bg-[#430562] hover:text-white transition-all">
                Apply
              </button>
            </div>
          </div>

          {/* Calculations */}
          <div className="space-y-3 pt-6">
            <div className="flex justify-between font-montserrat text-[16px] text-[#4d444f]">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between font-montserrat text-[16px] text-[#4d444f]">
              <span>Shipping</span>
              <span className="italic text-[14px]">Calculated next step</span>
            </div>
            <div className="flex justify-between items-baseline pt-4 border-t border-[#cfc2d1]/20">
              <span className="font-montserrat text-[14px] font-semibold uppercase tracking-[0.1em] text-[#1d1b1e]">Total</span>
              <div className="text-right">
                <span className="font-montserrat text-[12px] text-[#4d444f] mr-2">KES</span>
                <span className="font-playfair text-[32px] font-semibold text-[#430562]">
                  {new Intl.NumberFormat('en-KE').format(subtotal / 100)}
                </span>
              </div>
            </div>
          </div>

          {/* Trust Signals */}
          <div className="pt-8 flex flex-col items-center gap-4 text-[#4d444f] opacity-60">
            <div className="flex gap-6">
              <Lock className="w-6 h-6" />
              <ShieldCheck className="w-6 h-6" />
              <CreditCard className="w-6 h-6" />
            </div>
            <p className="font-montserrat text-[10px] font-semibold uppercase tracking-widest text-center">
              Secure M-PESA & Card Payments
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
