'use client';

import * as React from 'react';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PriceBlock } from '@/components/storefront/price-block';
import { publicImageUrl, type ProductCardData } from '@/lib/queries/catalogue-types';
import { addToCartAction, toggleWishlistAction } from '@/app/(storefront)/actions';
import { addToGuestCart } from '@/lib/guest-cart';
import { useSession } from '@/lib/auth/session-client';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store/cart-store';

interface QuickAddProductCardProps {
  product: ProductCardData & {
    /** First active variant id (needed for quick add). */
    firstVariantId?: string | null;
  };
  sizes?: string;
}

export function QuickAddProductCard({ product, sizes }: QuickAddProductCardProps) {
  const reduced = useReducedMotion();
  const session = useSession();
  const [adding, setAdding] = React.useState(false);
  const [wished, setWished] = React.useState(false);
  const coverSrc = product.coverImage
    ? publicImageUrl(product.coverImage.storagePath)
    : null;

  const router = useRouter();
  const optimisticAdd = useCartStore(s => s.optimisticAdd);
  const rollback = useCartStore(s => s.rollback);
  const currentCart = useCartStore(s => s.cart);

  const onAdd = async () => {
    if (!product.firstVariantId) return;
    setAdding(true);
    
    const prevCart = currentCart;
    const optimisticItem = {
      id: `temp-${Date.now()}`,
      variantId: product.firstVariantId,
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      variantTitle: null, // Quick add does not know the exact variant title
      size: null,
      color: null,
      metal: null,
      sku: null,
      imagePath: product.coverImage?.storagePath ?? null,
      quantity: 1,
      unitPriceCents: product.priceCents,
      lineTotalCents: product.priceCents,
      currency: product.currency,
      available: 99, // default
    };

    optimisticAdd(optimisticItem);
    
    try {
      if (!session) {
        addToGuestCart(product.firstVariantId, 1);
        toast.success(`${product.name} added to your bag. Sign in to keep it across devices.`);
        router.refresh();
        return;
      }
      const res = await addToCartAction({ variantId: product.firstVariantId, quantity: 1 });
      if (res.ok) {
        toast.success(`${product.name} added to your bag.`);
        router.refresh();
      } else {
        toast.error(res.message ?? 'Could not add to bag');
        rollback(prevCart);
      }
    } catch (e) {
      toast.error('Network error');
      rollback(prevCart);
    } finally {
      setAdding(false);
    }
  };

  const onWish = async () => {
    setWished((prev) => !prev);
    const res = await toggleWishlistAction({ productId: product.id });
    if (!res.ok) {
      setWished(false);
      toast.error('Sign in to save pieces to your wishlist.');
      return;
    }
    toast.success(res.added ? 'Saved to wishlist.' : 'Removed from wishlist.');
  };

  return (
    <div className="group space-y-4">
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-[4/5] overflow-hidden bg-muted/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {coverSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverSrc}
            alt={product.coverImage?.altText ?? product.name}
            className="h-full w-full object-cover transition-transform duration-700 ease-elegant group-hover:scale-[1.02]"
            loading="lazy"
            decoding="async"
            sizes={sizes}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-bone-100 font-serif text-sm uppercase tracking-[0.18em]">
            {product.name}
          </div>
        )}

        {product.compareAtPriceCents != null &&
        product.compareAtPriceCents > product.priceCents ? (
          <div className="absolute left-3 top-3">
            <Badge variant="sale">Sale</Badge>
          </div>
        ) : null}

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="absolute inset-x-3 bottom-3 flex translate-y-2 items-center gap-2 opacity-0 transition-all duration-300 ease-elegant group-hover:translate-y-0 group-hover:opacity-100"
        >
          <Button
            type="button"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              onAdd();
            }}
            disabled={!product.inStock || adding || !product.firstVariantId}
            className="flex-1"
          >
            <ShoppingBag className="h-3.5 w-3.5" aria-hidden /> {adding ? 'Adding…' : 'Quick add'}
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              onWish();
            }}
            aria-label={wished ? 'Remove from wishlist' : 'Save to wishlist'}
            className="bg-background"
          >
            <Heart
              className={cn('h-4 w-4', wished && 'fill-accent text-accent')}
              aria-hidden
            />
          </Button>
        </motion.div>
      </Link>

      <div className="space-y-1.5">
        {product.category ? (
          <p className="eyebrow text-muted-foreground">{product.category.name}</p>
        ) : null}
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-serif text-lg leading-snug tracking-tight">
            <Link href={`/products/${product.slug}`} className="link-elegant">
              {product.name}
            </Link>
          </h3>
        </div>
        <PriceBlock
          priceCents={product.priceCents}
          compareAtPriceCents={product.compareAtPriceCents}
          currency={product.currency}
          size="sm"
        />
        {!product.inStock ? (
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Sold out</p>
        ) : null}
      </div>
    </div>
  );
}

// Helper — used as alternative to the standard product card when the caller
// needs both quick-add and a "view" link in the hover overlay.
export function QuickAddCardLink({ product }: { product: ProductCardData }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="inline-flex items-center gap-1 text-eyebrow uppercase text-foreground transition-colors hover:text-accent"
    >
      View piece <Eye className="h-3.5 w-3.5" aria-hidden />
    </Link>
  );
}
