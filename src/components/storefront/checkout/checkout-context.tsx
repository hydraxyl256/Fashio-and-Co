'use client';

import * as React from 'react';
import type { CheckoutFormData } from '@/lib/checkout/validation';

interface CartItem {
  variantId: string;
  quantity: number;
}

interface CheckoutContextType {
  data: Partial<CheckoutFormData>;
  updateData: (updates: Partial<CheckoutFormData>) => void;
  cartItems: CartItem[];
  setCartItems: (items: CartItem[]) => void;
  subtotal: number;
  setSubtotal: (val: number) => void;
}

const CheckoutContext = React.createContext<CheckoutContextType | null>(null);

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = React.useState<Partial<CheckoutFormData>>({
    paymentMethod: 'mpesa',
    acceptTerms: true,
    acceptPrivacy: true,
  });
  const [cartItems, setCartItems] = React.useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = React.useState(0);

  const updateData = React.useCallback((updates: Partial<CheckoutFormData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  }, []);

  return (
    <CheckoutContext.Provider value={{ data, updateData, cartItems, setCartItems, subtotal, setSubtotal }}>
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = React.useContext(CheckoutContext);
  if (!context) throw new Error('useCheckout must be used within CheckoutProvider');
  return context;
}
