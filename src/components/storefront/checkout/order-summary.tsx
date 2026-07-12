'use client';

import { useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { CheckoutFormData } from '@/lib/checkout/validation';

interface CheckoutOrderSummaryProps {
  form: UseFormReturn<CheckoutFormData>;
  cartItems: Array<{ variantId: string; quantity: number }>;
}

export function CheckoutOrderSummary({
  form,
  cartItems,
}: CheckoutOrderSummaryProps) {
  // For now, we'll show a placeholder
  // In a real app, fetch product details from cartItems
  const subtotal = useMemo(() => {
    // This would be calculated from cart items
    // For now returning 0, will be populated by parent component
    return 0;
  }, [cartItems]);

  const shippingCost = 0; // Will be set when delivery method is selected
  const discount = 0; // Will be set when discount is applied
  const total = subtotal + shippingCost - discount;

  return (
    <div className="sticky top-4">
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <h3 className="font-bold text-lg mb-6">Order Summary</h3>

        <div className="space-y-4 mb-6 pb-6 border-b">
          {cartItems.length === 0 ? (
            <p className="text-sm text-gray-600">Your cart is empty</p>
          ) : (
            <div className="space-y-2">
              {cartItems.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Item × {item.quantity}
                  </span>
                  <span className="font-medium">-</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3 text-sm mb-6">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>KES {(subtotal / 100).toFixed(2)}</span>
          </div>

          {shippingCost > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span>KES {(shippingCost / 100).toFixed(2)}</span>
            </div>
          )}

          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-KES {(discount / 100).toFixed(2)}</span>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="font-bold">Total</span>
            <span className="text-2xl font-bold">KES {(total / 100).toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-6 space-y-2 text-xs text-gray-600">
          <p className="flex gap-2">
            <span>✓</span>
            <span>Secure checkout with Pesapal</span>
          </p>
          <p className="flex gap-2">
            <span>✓</span>
            <span>30-day returns</span>
          </p>
          <p className="flex gap-2">
            <span>✓</span>
            <span>Free returns & exchanges</span>
          </p>
        </div>
      </div>
    </div>
  );
}
