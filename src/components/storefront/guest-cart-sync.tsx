'use client';

import { useEffect } from 'react';

import { readGuestCart } from '@/lib/guest-cart';

/**
 * Bridges the local guest cart into the UI. On the server we only know
 * about the signed-in user's cart; for signed-out shoppers we read the
 * localStorage-backed guest cart on mount and re-emit a `storage` event
 * so the bag badge and drawer can update.
 */
export function GuestCartSync({ onCount }: { onCount?: (count: number) => void }) {
  useEffect(() => {
    const sync = () => {
      const cart = readGuestCart();
      const count = cart.items.reduce((sum, i) => sum + i.quantity, 0);
      onCount?.(count);
    };
    sync();
    window.addEventListener('storage', sync);
    window.addEventListener('fc:guest-cart-changed', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('fc:guest-cart-changed', sync);
    };
  }, [onCount]);
  return null;
}
