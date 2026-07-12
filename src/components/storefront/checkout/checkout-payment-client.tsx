'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useCheckout } from './checkout-context';
import { Lock, Smartphone, CreditCard } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart-store';
import { publicImageUrl } from '@/lib/queries/catalogue-types';

export function CheckoutPaymentClient() {
  const router = useRouter();
  const { data, updateData } = useCheckout();
  const cart = useCartStore((s) => s.cart);
  
  const [deliveryType, setDeliveryType] = React.useState('standard');
  const [paymentMethod, setPaymentMethod] = React.useState('mpesa');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Fallback to Information if email is missing (e.g., hard refresh)
  React.useEffect(() => {
    if (!data.email) {
      router.push('/checkout');
    }
  }, [data.email, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call to process payment
    setTimeout(() => {
      // Simulate random success/failure for demonstration
      if (Math.random() > 0.8) {
        router.push('/checkout/payment-failed');
      } else {
        router.push('/checkout/confirmation?orderId=FC-2024-000123');
      }
    }, 1500);
  };

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(cents / 100);

  const items = cart?.items || [];
  const subtotal = cart?.subtotalCents || 0;
  const deliveryCost = deliveryType === 'express' ? 80000 : 30000;
  const total = subtotal + deliveryCost;

  if (!data.email) return null; // Avoid rendering flash before redirect

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
      <div className="lg:col-span-7 space-y-12">
        <form onSubmit={handleSubmit} className="space-y-12">
          
          {/* Section 1: Delivery Options */}
          <section>
            <h2 className="font-playfair text-[24px] font-semibold text-[#430562] mb-8 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full border border-[#430562] flex items-center justify-center text-[12px] font-bold">1</span>
              Delivery Options
            </h2>
            <div className="space-y-4">
              
              <label className={`block border rounded-lg p-6 cursor-pointer transition-all ${deliveryType === 'standard' ? 'border-[#430562] bg-[#f8f2f6]' : 'border-[#cfc2d1] hover:border-[#430562]/50'}`}>
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${deliveryType === 'standard' ? 'border-[#430562] bg-[#430562]' : 'border-[#cfc2d1]'}`}>
                      {deliveryType === 'standard' && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <div>
                      <h4 className="font-montserrat text-[16px] font-semibold text-[#1d1b1e]">Standard Delivery</h4>
                      <p className="font-montserrat text-[12px] text-[#4d444f] mt-1">2-3 Business Days via G4S</p>
                    </div>
                  </div>
                  <p className="font-playfair text-[20px] font-semibold text-[#1d1b1e]">{formatPrice(30000)}</p>
                </div>
                <input
                  type="radio"
                  name="delivery"
                  value="standard"
                  className="hidden"
                  checked={deliveryType === 'standard'}
                  onChange={() => setDeliveryType('standard')}
                />
              </label>

              <label className={`block border rounded-lg p-6 cursor-pointer transition-all ${deliveryType === 'express' ? 'border-[#430562] bg-[#f8f2f6]' : 'border-[#cfc2d1] hover:border-[#430562]/50'}`}>
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${deliveryType === 'express' ? 'border-[#430562] bg-[#430562]' : 'border-[#cfc2d1]'}`}>
                      {deliveryType === 'express' && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <div>
                      <h4 className="font-montserrat text-[16px] font-semibold text-[#1d1b1e]">Express Delivery</h4>
                      <p className="font-montserrat text-[12px] text-[#4d444f] mt-1">Next Business Day Delivery</p>
                    </div>
                  </div>
                  <p className="font-playfair text-[20px] font-semibold text-[#1d1b1e]">{formatPrice(80000)}</p>
                </div>
                <input
                  type="radio"
                  name="delivery"
                  value="express"
                  className="hidden"
                  checked={deliveryType === 'express'}
                  onChange={() => setDeliveryType('express')}
                />
              </label>
            </div>
          </section>

          {/* Section 2: Payment Selection */}
          <section>
            <h2 className="font-playfair text-[24px] font-semibold text-[#430562] mb-8 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full border border-[#430562] flex items-center justify-center text-[12px] font-bold">2</span>
              Payment Method
            </h2>
            <div className="space-y-4">
              
              {/* M-PESA */}
              <div className="border border-[#cfc2d1] rounded-lg overflow-hidden transition-all duration-300">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('mpesa')}
                  className="w-full flex items-center justify-between p-6 bg-white hover:bg-[#f8f2f6] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 rounded bg-[#4CAF50] flex items-center justify-center font-bold text-white text-[10px] uppercase">
                      M-PESA
                    </div>
                    <span className="font-montserrat text-[14px] font-semibold uppercase tracking-wider text-[#1d1b1e]">Pay via M-PESA</span>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${paymentMethod === 'mpesa' ? 'border-[#430562] bg-[#430562]' : 'border-[#cfc2d1]'}`}>
                    {paymentMethod === 'mpesa' && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </button>
                {paymentMethod === 'mpesa' && (
                  <div className="p-6 pt-0 bg-white">
                    <div className="max-w-md">
                      <p className="font-montserrat text-[12px] text-[#4d444f] mb-4">
                        Enter your M-PESA registered phone number. You will receive a prompt on your phone to enter your PIN.
                      </p>
                      <div className="relative border-b border-[#cfc2d1] focus-within:border-[#430562] transition-all">
                        <label className="block font-montserrat text-[12px] text-[#430562] uppercase font-semibold mb-1">Phone Number</label>
                        <div className="flex items-center gap-2 pb-2">
                          <span className="text-[#4d444f] font-montserrat text-[14px]">+254</span>
                          <input
                            required
                            type="tel"
                            className="w-full bg-transparent border-none focus:outline-none p-0 text-[#1d1b1e] font-montserrat text-[16px] placeholder:text-[#cfc2d1]"
                            placeholder="712 345 678"
                            defaultValue={data.phone?.replace('+254', '').trim() || ''}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Credit Card */}
              <div className="border border-[#cfc2d1] rounded-lg overflow-hidden transition-all duration-300">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className="w-full flex items-center justify-between p-6 bg-white hover:bg-[#f8f2f6] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex gap-1">
                      <div className="w-10 h-7 rounded border border-[#cfc2d1]/30 flex items-center justify-center text-[8px] bg-[#f8f2f6] text-[#4d444f] font-bold">VISA</div>
                      <div className="w-10 h-7 rounded border border-[#cfc2d1]/30 flex items-center justify-center text-[8px] bg-[#f8f2f6] text-[#4d444f] font-bold">MC</div>
                    </div>
                    <span className="font-montserrat text-[14px] font-semibold uppercase tracking-wider text-[#1d1b1e]">Credit / Debit Card</span>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${paymentMethod === 'card' ? 'border-[#430562] bg-[#430562]' : 'border-[#cfc2d1]'}`}>
                    {paymentMethod === 'card' && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </button>
                {paymentMethod === 'card' && (
                  <div className="p-6 pt-0 bg-white">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-8">
                      <div className="col-span-2 relative border-b border-[#cfc2d1] focus-within:border-[#430562] transition-all">
                        <label className="block font-montserrat text-[12px] text-[#430562] uppercase font-semibold mb-1">Card Number</label>
                        <input
                          required
                          type="text"
                          className="w-full bg-transparent border-none focus:outline-none p-0 pb-2 text-[#1d1b1e] font-montserrat text-[16px] placeholder:text-[#cfc2d1]"
                          placeholder="0000 0000 0000 0000"
                        />
                      </div>
                      <div className="relative border-b border-[#cfc2d1] focus-within:border-[#430562] transition-all">
                        <label className="block font-montserrat text-[12px] text-[#430562] uppercase font-semibold mb-1">Expiry Date</label>
                        <input
                          required
                          type="text"
                          className="w-full bg-transparent border-none focus:outline-none p-0 pb-2 text-[#1d1b1e] font-montserrat text-[16px] placeholder:text-[#cfc2d1]"
                          placeholder="MM / YY"
                        />
                      </div>
                      <div className="relative border-b border-[#cfc2d1] focus-within:border-[#430562] transition-all">
                        <label className="block font-montserrat text-[12px] text-[#430562] uppercase font-semibold mb-1">CVV</label>
                        <input
                          required
                          type="password"
                          className="w-full bg-transparent border-none focus:outline-none p-0 pb-2 text-[#1d1b1e] font-montserrat text-[16px] placeholder:text-[#cfc2d1]"
                          placeholder="123"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Action Button */}
          <div className="pt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#430562] text-white py-4 rounded-lg font-montserrat text-[14px] font-semibold uppercase tracking-widest hover:bg-[#3d174f] transition-all duration-300 flex items-center justify-center gap-2 shadow-xl shadow-[#430562]/20 disabled:opacity-70"
            >
              {isSubmitting ? 'Processing...' : 'Complete Purchase'}
              {!isSubmitting && <Lock className="w-5 h-5" />}
            </button>
            <p className="text-center font-montserrat text-[11px] text-[#7e7480] mt-6 uppercase tracking-tight">
              Payments are secure and encrypted
            </p>
          </div>
        </form>
      </div>

      {/* Right: Order Summary */}
      <div className="lg:col-span-5 lg:sticky lg:top-32">
        <div className="bg-[#f8f2f6] p-8 border border-[#cfc2d1]/30 shadow-xl shadow-[#430562]/5 space-y-6">
          <h3 className="font-playfair text-[24px] font-semibold text-[#1d1b1e] border-b border-[#cfc2d1]/30 pb-4">Order Summary</h3>
          
          <div className="space-y-6 mb-8 border-b border-[#cfc2d1]/30 pb-8 max-h-[409px] overflow-y-auto pr-2 custom-scrollbar">
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
                <div className="flex flex-col justify-between py-1 flex-grow">
                  <div>
                    <h4 className="font-playfair text-[16px] font-semibold text-[#1d1b1e] leading-tight">
                      {item.productName}
                    </h4>
                    <p className="font-montserrat text-[12px] text-[#4d444f] mt-1">
                      {item.size || 'One Size'} | {item.color || 'Standard'}
                      {item.quantity > 1 ? ` (x${item.quantity})` : ''}
                    </p>
                  </div>
                  <p className="font-montserrat text-[14px] font-medium text-[#1d1b1e]">
                    {formatPrice(item.lineTotalCents)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 text-[#4d444f]">
            <div className="flex justify-between font-montserrat text-[16px]">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between font-montserrat text-[16px]">
              <span>Delivery</span>
              <span>{formatPrice(deliveryCost)}</span>
            </div>
            <div className="flex justify-between font-montserrat text-[16px] pt-4 border-t border-[#cfc2d1]/30 text-[#1d1b1e] font-bold">
              <span className="text-[24px] font-playfair text-[#430562]">Total</span>
              <span className="text-[24px] font-playfair text-[#430562]">{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
