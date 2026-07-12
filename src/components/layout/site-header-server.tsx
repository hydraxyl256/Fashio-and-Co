import { getSession } from '@/lib/auth/session';
import { getCartForCurrentUser } from '@/lib/queries/cart';
import { getWishlistProductIds } from '@/lib/queries/wishlist';
import { createSupabaseServiceRoleClient } from '@/lib/supabase/admin';

import { SiteHeader } from '@/components/layout/site-header';
import { CartStoreInitializer } from '@/components/storefront/cart-store-initializer';
import type { CartDrawerItem } from '@/components/storefront/cart-drawer';
import type { WishlistItem } from '@/components/storefront/wishlist-drawer';

export async function SiteHeaderServer() {
  const [session, cart, wishlistIds] = await Promise.all([
    getSession(),
    getCartForCurrentUser(),
    getWishlistProductIds(),
  ]);

  let wishlist: WishlistItem[] = [];
  if (wishlistIds.length > 0) {
    const admin = await createSupabaseServiceRoleClient();
    const { data: products } = await admin
      .from('products')
      .select(
        'id, slug, name, price_cents, compare_at_price_cents, currency, images:product_images (storage_path, is_cover, display_order)',
      )
      .in('id', wishlistIds);
    wishlist = (products ?? []).map((p) => {
      const images = ((p.images ?? []) as unknown) as Array<{ storage_path: string; is_cover: boolean; display_order: number }>;
      const cover = images.find((i) => i.is_cover) ?? images.slice().sort((a, b) => a.display_order - b.display_order)[0];
      return {
        productId: p.id,
        productName: p.name,
        productSlug: p.slug,
        priceCents: p.price_cents,
        compareAtPriceCents: p.compare_at_price_cents,
        currency: p.currency,
        coverImagePath: cover?.storage_path ?? null,
      };
    });
  }

  return (
    <>
      <CartStoreInitializer initialCart={cart} />
      <SiteHeader
        signedIn={!!session}
        wishlist={{ items: wishlist }}
      />
    </>
  );
}
