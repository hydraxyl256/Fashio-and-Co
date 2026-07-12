'use client';

import * as React from 'react';
import { Heart, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { toast } from 'sonner';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { publicImageUrl } from '@/lib/queries/catalogue-types';
import { removeWishlistItemAction } from '@/app/(storefront)/actions';

export interface WishlistItem {
  productId: string;
  productName: string;
  productSlug: string;
  priceCents: number;
  compareAtPriceCents: number | null;
  currency: string;
  coverImagePath: string | null;
}

interface WishlistDrawerProps {
  items: WishlistItem[];
  children: React.ReactNode;
  signedIn: boolean;
}

export function WishlistDrawer({ items, children, signedIn }: WishlistDrawerProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="flex w-full max-w-md flex-col p-0">
        <SheetHeader className="border-b border-border">
          <SheetTitle>Saved pieces</SheetTitle>
          <SheetDescription>
            {items.length === 0 ? 'No saved pieces yet.' : `${items.length} saved`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {!signedIn ? (
            <div className="p-6">
              <EmptyState
                icon={<Heart className="h-8 w-8" aria-hidden />}
                title="Sign in to save"
                description="Create an account or sign in to save pieces across visits."
                action={
                  <Button asChild>
                    <Link href="/sign-in?next=/account/wishlist">Sign in</Link>
                  </Button>
                }
              />
            </div>
          ) : items.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<Heart className="h-8 w-8" aria-hidden />}
                title="No saved pieces"
                description="Tap the heart on any piece to save it for later."
                action={
                  <Button asChild variant="outline">
                    <Link href="/collections">Browse the edit</Link>
                  </Button>
                }
              />
            </div>
          ) : (
            <ul className="divide-y divide-border">
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <WishlistLine key={item.productId} item={item} />
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function WishlistLine({ item }: { item: WishlistItem }) {
  const reduced = useReducedMotion();
  const [pending, setPending] = React.useState(false);
  const img = item.coverImagePath ? publicImageUrl(item.coverImagePath) : null;

  const remove = async () => {
    setPending(true);
    try {
      const res = await removeWishlistItemAction({ productId: item.productId });
      if (res.ok) toast.success('Removed from wishlist.');
      else toast.error('Could not update wishlist.');
    } finally {
      setPending(false);
    }
  };

  return (
    <motion.li
      layout={!reduced}
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex gap-4 p-6"
    >
      <Link
        href={`/products/${item.productSlug}`}
        className="relative h-28 w-24 shrink-0 overflow-hidden bg-muted/40"
      >
        {img ? <Image src={img} alt={item.productName} fill sizes="96px" className="object-cover" /> : null}
      </Link>
      <div className="flex min-w-0 flex-1 items-start justify-between">
        <div>
          <Link href={`/products/${item.productSlug}`} className="font-serif text-base leading-snug">
            {item.productName}
          </Link>
          <p className="text-sm text-muted-foreground">
            {new Intl.NumberFormat('en-KE', { style: 'currency', currency: item.currency }).format(
              item.priceCents / 100,
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={remove}
          disabled={pending}
          aria-label={`Remove ${item.productName}`}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </motion.li>
  );
}
