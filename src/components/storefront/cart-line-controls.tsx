'use client';

import * as React from 'react';
import { Minus, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

import { removeCartItemAction, updateCartItemAction } from '@/app/(storefront)/actions';
import { toggleWishlistAction } from '@/app/(storefront)/actions';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/lib/store/cart-store';

interface UpdateCartLineProps {
  itemId: string;
  productId?: string;
  quantity: number;
  available: number;
}

export function UpdateCartLine({ itemId, productId, quantity, available }: UpdateCartLineProps) {
  const [pending, setPending] = React.useState(false);
  const [q, setQ] = React.useState(quantity);

  const updateQty = useCartStore(s => s.optimisticUpdateQuantity);
  const removeQty = useCartStore(s => s.optimisticRemove);
  const rollback = useCartStore(s => s.rollback);
  const cart = useCartStore(s => s.cart);

  React.useEffect(() => setQ(quantity), [quantity]);

  const update = async (next: number) => {
    if (next === q) return;
    setPending(true);
    const prevCart = cart;
    try {
      updateQty(itemId, next);
      const res = await updateCartItemAction({ itemId, quantity: next });
      if (!res.ok) {
        toast.error(res.message ?? 'Could not update bag');
        rollback(prevCart);
      }
    } finally {
      setPending(false);
    }
  };

  const remove = async () => {
    setPending(true);
    const prevCart = cart;
    try {
      removeQty(itemId);
      const res = await removeCartItemAction({ itemId });
      if (res.ok) toast.success('Removed from bag.');
      else {
        toast.error(res.message ?? 'Could not remove');
        rollback(prevCart);
      }
    } finally {
      setPending(false);
    }
  };

  const saveForLater = async () => {
    if (!productId) return;
    setPending(true);
    const prevCart = cart;
    try {
      removeQty(itemId);
      await toggleWishlistAction({ productId });
      await removeCartItemAction({ itemId });
      toast.success('Saved for later.');
    } catch (e) {
      toast.error('Could not save for later.');
      rollback(prevCart);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 mt-auto">
      {/* Quantity Controls */}
      <div className="inline-flex items-center border border-[#cfc2d1] w-fit">
        <button
          type="button"
          onClick={() => update(Math.max(0, q - 1))}
          disabled={pending || q <= 1}
          className="w-8 h-8 flex items-center justify-center text-[#4d444f] hover:text-[#430562] disabled:opacity-50 transition-colors"
          aria-label="Decrease quantity"
        >
          <Minus className="h-3 w-3" aria-hidden />
        </button>
        <span className="w-8 text-center font-montserrat text-[14px] text-[#1d1b1e]" aria-live="polite">
          {q}
        </span>
        <button
          type="button"
          onClick={() => update(q + 1)}
          disabled={pending || q >= available}
          className="w-8 h-8 flex items-center justify-center text-[#4d444f] hover:text-[#430562] disabled:opacity-50 transition-colors"
          aria-label="Increase quantity"
        >
          <Plus className="h-3 w-3" aria-hidden />
        </button>
      </div>

      {/* Action Links */}
      <div className="flex items-center gap-4 font-montserrat text-[12px] font-medium uppercase tracking-wider">
        {productId && (
          <button
            type="button"
            onClick={saveForLater}
            disabled={pending}
            className="text-[#430562] hover:text-[#775a1a] transition-colors border-b border-transparent hover:border-[#775a1a] pb-0.5"
          >
            Save for Later
          </button>
        )}
        <button
          type="button"
          onClick={remove}
          disabled={pending}
          className="text-[#4d444f] hover:text-[#d32f2f] transition-colors border-b border-transparent hover:border-[#d32f2f] pb-0.5"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
