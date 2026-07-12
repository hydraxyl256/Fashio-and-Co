'use client';

import { useEffect, useRef } from 'react';
import { useCartStore } from '@/lib/store/cart-store';
import type { CartView } from '@/lib/queries/cart';

interface CartStoreInitializerProps {
  initialCart: CartView | null;
}

export function CartStoreInitializer({ initialCart }: CartStoreInitializerProps) {
  const initialized = useRef(false);
  const setCart = useCartStore((s) => s.setCart);

  // Initialize immediately on first render for SSR hydration
  if (!initialized.current) {
    useCartStore.setState({ cart: initialCart });
    initialized.current = true;
  }

  // Update store if initialCart changes (e.g. from router.refresh())
  useEffect(() => {
    setCart(initialCart);
  }, [initialCart, setCart]);

  return null;
}
