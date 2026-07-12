'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, X } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { toast } from 'sonner';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { formatCurrency } from '@/lib/format';
import { publicImageUrl } from '@/lib/queries/catalogue-types';
import { useCartStore } from '@/lib/store/cart-store';
import { removeCartItemAction, updateCartItemAction } from '@/app/(storefront)/actions';
import { cn } from '@/lib/utils';
import { ShoppingBag } from 'lucide-react';
import type { CartItemView } from '@/lib/queries/cart';

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function CartDrawer({ open, onOpenChange, children }: CartDrawerProps) {
  const cart = useCartStore((s) => s.cart);
  const items = cart?.items ?? [];
  const subtotalCents = cart?.subtotalCents ?? 0;
  const currency = cart?.currency ?? 'KES';

  const formatPrice = (cents: number, cur: string) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: cur, minimumFractionDigits: 0 }).format(cents / 100);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="flex w-full max-w-[480px] flex-col p-0 bg-white font-montserrat">
        
        <SheetHeader className="px-6 py-6 border-b border-[#cfc2d1]/50 relative">
          <SheetTitle className="font-playfair text-[32px] font-bold text-[#430562] leading-none">
            Your Bag
          </SheetTitle>
          <SheetDescription className="font-montserrat text-[14px] text-[#4d444f] mt-1">
            {items.length === 0
              ? 'Your bag is empty'
              : `${items.length} ${items.length === 1 ? 'item' : 'items'}`}
          </SheetDescription>
          <SheetClose className="absolute right-6 top-6 text-[#4d444f] hover:text-[#430562] transition-colors">
            <X className="w-6 h-6" />
            <span className="sr-only">Close</span>
          </SheetClose>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <ShoppingBag className="w-12 h-12 text-[#cfc2d1] mb-4" />
              <p className="font-playfair text-[24px] font-semibold text-[#1d1b1e] mb-2">Your Bag is Empty</p>
              <p className="text-[14px] text-[#4d444f] mb-8">
                Begin with a single piece — a linen dress, a brass cuff, a signet ring.
              </p>
              <SheetClose asChild>
                <Link
                  href="/collections/shop"
                  className="bg-[#430562] text-white px-8 py-4 text-[14px] font-semibold uppercase tracking-wider hover:bg-[#3d174f] transition-colors"
                >
                  Browse the edit
                </Link>
              </SheetClose>
            </div>
          ) : (
            <ul className="divide-y divide-[#cfc2d1]/50">
              {items.map((item) => (
                <CartLine key={item.id} item={item} />
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <footer className="border-t border-[#cfc2d1]/50 p-6 bg-[#fef8fc]">
            <div className="flex items-center justify-between mb-2">
              <p className="font-montserrat text-[16px] font-semibold uppercase tracking-wider text-[#1d1b1e]">Subtotal</p>
              <p className="font-montserrat text-[20px] font-semibold text-[#1d1b1e]">{formatPrice(subtotalCents, currency)}</p>
            </div>
            <p className="text-[12px] text-[#4d444f] mb-6">
              Delivery and taxes calculated at checkout.
            </p>
            
            <div className="flex flex-col gap-3">
              <SheetClose asChild>
                <Link
                  href="/checkout"
                  className="w-full bg-[#430562] text-white text-center py-4 text-[14px] font-semibold uppercase tracking-wider hover:bg-[#3d174f] transition-colors"
                >
                  Proceed to Checkout
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link
                  href="/bag"
                  className="w-full text-center py-4 text-[14px] font-semibold uppercase tracking-wider border border-[#430562] text-[#430562] hover:bg-[#fef8fc] transition-colors"
                >
                  View Full Bag
                </Link>
              </SheetClose>
            </div>
          </footer>
        )}
      </SheetContent>
    </Sheet>
  );
}

function CartLine({ item }: { item: CartItemView }) {
  const reduced = useReducedMotion();
  const [quantity, setQuantity] = React.useState(item.quantity);
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    setQuantity(item.quantity);
  }, [item.quantity]);

  const updateQty = useCartStore(s => s.optimisticUpdateQuantity);
  const removeQty = useCartStore(s => s.optimisticRemove);
  const rollback = useCartStore(s => s.rollback);
  const cart = useCartStore(s => s.cart);

  const update = async (next: number) => {
    if (next === quantity) return;
    setPending(true);
    const prev = cart;
    try {
      updateQty(item.id, next);
      const res = await updateCartItemAction({ itemId: item.id, quantity: next });
      if (!res.ok) {
        toast.error(res.message ?? 'Could not update bag');
        rollback(prev);
      }
    } finally {
      setPending(false);
    }
  };

  const remove = async () => {
    setPending(true);
    const prev = cart;
    try {
      removeQty(item.id);
      const res = await removeCartItemAction({ itemId: item.id });
      if (!res.ok) {
        toast.error(res.message ?? 'Could not remove from bag');
        rollback(prev);
      } else {
        toast.success('Removed from bag.');
      }
    } finally {
      setPending(false);
    }
  };

  const image = item.imagePath ? publicImageUrl(item.imagePath) : null;
  const priceFormatted = new Intl.NumberFormat('en-KE', { style: 'currency', currency: item.currency, minimumFractionDigits: 0 }).format(item.lineTotalCents / 100);

  return (
    <motion.li
      layout={!reduced}
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex gap-6 p-6"
    >
      <SheetClose asChild>
        <Link
          href={item.productSlug ? `/products/${item.productSlug}` : '#'}
          className="relative h-[100px] w-[80px] shrink-0 overflow-hidden bg-[#f2ecf0] group"
        >
          {image ? (
            <Image 
              src={image} 
              alt={item.productName} 
              fill 
              sizes="80px" 
              className="object-cover transition-transform duration-500 group-hover:scale-105" 
            />
          ) : null}
        </Link>
      </SheetClose>
      
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-start gap-4">
          <div>
            <SheetClose asChild>
              <Link
                href={item.productSlug ? `/products/${item.productSlug}` : '#'}
                className="font-montserrat text-[14px] font-semibold uppercase tracking-wider text-[#1d1b1e] hover:text-[#430562] transition-colors"
              >
                {item.productName}
              </Link>
            </SheetClose>
            {item.variantTitle && (
              <p className="text-[12px] text-[#4d444f] mt-1">{item.variantTitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="text-[#4d444f] hover:text-[#d32f2f] transition-colors"
            aria-label={`Remove ${item.productName} from bag`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div className="inline-flex items-center border border-[#cfc2d1]">
            <button
              type="button"
              onClick={() => update(Math.max(0, quantity - 1))}
              disabled={pending || quantity <= 1}
              className="w-8 h-8 flex items-center justify-center text-[#4d444f] hover:text-[#430562] disabled:opacity-50 transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-8 text-center text-[14px] font-montserrat text-[#1d1b1e]">{quantity}</span>
            <button
              type="button"
              onClick={() => update(quantity + 1)}
              disabled={pending || quantity >= item.available}
              className="w-8 h-8 flex items-center justify-center text-[#4d444f] hover:text-[#430562] disabled:opacity-50 transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <span className="font-montserrat text-[14px] font-medium text-[#1d1b1e]">
            {priceFormatted}
          </span>
        </div>
      </div>
    </motion.li>
  );
}
