import { create } from 'zustand';
import type { CartView, CartItemView } from '@/lib/queries/cart';

interface CartState {
  cart: CartView | null;
  isDrawerOpen: boolean;
  
  // Actions
  setCart: (cart: CartView | null) => void;
  setDrawerOpen: (isOpen: boolean) => void;
  
  // Optimistic UI Actions
  optimisticAdd: (item: CartItemView) => void;
  optimisticRemove: (itemId: string) => void;
  optimisticUpdateQuantity: (itemId: string, quantity: number) => void;
  rollback: (previousCart: CartView | null) => void;
}

function recalculateCart(items: CartItemView[], currentCart: CartView | null): CartView {
  const subtotalCents = items.reduce((sum, item) => sum + (item.unitPriceCents * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  
  return {
    id: currentCart?.id ?? 'optimistic-cart',
    items,
    subtotalCents,
    itemCount,
    currency: currentCart?.currency ?? 'KES',
  };
}

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  isDrawerOpen: false,

  setCart: (cart) => set({ cart }),
  setDrawerOpen: (isOpen) => set({ isDrawerOpen: isOpen }),

  optimisticAdd: (newItem) => set((state) => {
    const items = state.cart?.items ? [...state.cart.items] : [];
    const existingIdx = items.findIndex(i => i.variantId === newItem.variantId);
    
    if (existingIdx >= 0) {
      const existing = items[existingIdx];
      if (existing) {
        items[existingIdx] = {
          ...existing,
          quantity: existing.quantity + newItem.quantity,
          lineTotalCents: existing.unitPriceCents * (existing.quantity + newItem.quantity),
        };
      }
    } else {
      items.unshift(newItem);
    }
    
    return {
      cart: recalculateCart(items, state.cart),
      isDrawerOpen: true, // Auto open drawer on add
    };
  }),

  optimisticRemove: (itemId) => set((state) => {
    if (!state.cart) return state;
    const items = state.cart.items.filter(i => i.id !== itemId);
    return { cart: recalculateCart(items, state.cart) };
  }),

  optimisticUpdateQuantity: (itemId, quantity) => set((state) => {
    if (!state.cart) return state;
    if (quantity <= 0) {
      const items = state.cart.items.filter(i => i.id !== itemId);
      return { cart: recalculateCart(items, state.cart) };
    }
    
    const items = state.cart.items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          quantity,
          lineTotalCents: item.unitPriceCents * quantity,
        };
      }
      return item;
    });
    return { cart: recalculateCart(items, state.cart) };
  }),

  rollback: (previousCart) => set({ cart: previousCart }),
}));
