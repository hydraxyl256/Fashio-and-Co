import 'server-only';

import { cache } from 'react';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseServiceRoleClient } from '@/lib/supabase/admin';
import { getSession } from '@/lib/auth/session';
import { revalidatePath } from 'next/cache';

export interface CartItemView {
  id: string;
  variantId: string;
  productId: string | null;
  productSlug: string | null;
  productName: string;
  variantTitle: string | null;
  size: string | null;
  color: string | null;
  metal: string | null;
  sku: string | null;
  imagePath: string | null;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
  currency: string;
  available: number;
}

export interface CartView {
  id: string;
  items: CartItemView[];
  subtotalCents: number;
  itemCount: number;
  currency: string;
}

/** Get (or create) the signed-in user's cart. */
export async function getOrCreateCartForUser(userId: string) {
  const supabase = await createSupabaseServerClient();

  const { data: existing } = await supabase
    .from('carts')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) return existing;

  const { data: created, error } = await supabase
    .from('carts')
    .insert({ user_id: userId })
    .select('*')
    .single();

  if (error || !created) {
    throw new Error('Could not create cart');
  }
  return created;
}

export const getCartForCurrentUser = cache(async (): Promise<CartView | null> => {
  const session = await getSession();
  if (!session) return null;

  const supabase = await createSupabaseServerClient();
  const cart = await getOrCreateCartForUser(session.user.id);

  const { data: items } = await supabase
    .from('cart_items')
    .select(
      `
      id, variant_id, quantity, unit_price_cents, currency,
      variant:product_variants!cart_items_variant_id_fkey (
        id, sku, size, color, metal, stock_quantity, reserved_quantity,
        product:products ( id, slug, name )
      )
    `,
    )
    .eq('cart_id', cart.id);

  type Row = {
    id: string;
    variant_id: string;
    quantity: number;
    unit_price_cents: number;
    currency: string;
    variant: {
      id: string;
      sku: string;
      size: string | null;
      color: string | null;
      metal: string | null;
      stock_quantity: number;
      reserved_quantity: number;
      product: { id: string; slug: string; name: string } | null;
    } | null;
  };

  const rows = (items ?? []) as unknown as Row[];

  // For each item, look up the cover image path via the admin client
  // (RLS only allows staff or the product's owning cart, and we are the
  // owning cart, so the regular server client is enough).
  const itemsView: CartItemView[] = await Promise.all(
    rows.map(async (row) => {
      const productId = row.variant?.product?.id ?? null;
      const productSlug = row.variant?.product?.slug ?? null;
      const productName = row.variant?.product?.name ?? 'Piece';

      let imagePath: string | null = null;
      if (productId) {
        // Use the admin client just for the image lookup to bypass RLS strictness on the products table join
        const { createSupabaseServiceRoleClient } = await import('@/lib/supabase/admin');
        const adminClient = await createSupabaseServiceRoleClient();
        
        const { data: img } = await adminClient
          .from('product_images')
          .select('storage_path, is_cover, display_order')
          .eq('product_id', productId)
          .order('is_cover', { ascending: false })
          .order('display_order', { ascending: true })
          .limit(1)
          .maybeSingle();
        imagePath = img?.storage_path ?? null;
      }

      const available = row.variant
        ? Math.max(0, row.variant.stock_quantity - row.variant.reserved_quantity)
        : 0;

      return {
        id: row.id,
        variantId: row.variant_id,
        productId,
        productSlug,
        productName,
        variantTitle: row.variant
          ? [row.variant.size, row.variant.color, row.variant.metal].filter(Boolean).join(' · ')
          : null,
        size: row.variant?.size ?? null,
        color: row.variant?.color ?? null,
        metal: row.variant?.metal ?? null,
        sku: row.variant?.sku ?? null,
        imagePath,
        quantity: row.quantity,
        unitPriceCents: row.unit_price_cents,
        lineTotalCents: row.unit_price_cents * row.quantity,
        currency: row.currency,
        available,
      };
    }),
  );

  const subtotalCents = itemsView.reduce((acc, i) => acc + i.lineTotalCents, 0);
  const itemCount = itemsView.reduce((acc, i) => acc + i.quantity, 0);

  return {
    id: cart.id,
    items: itemsView,
    subtotalCents,
    itemCount,
    currency: itemsView[0]?.currency ?? 'KES',
  };
});

/** Get the cart count for the navigation badge. */
export async function getCartItemCount(): Promise<number> {
  const cart = await getCartForCurrentUser();
  return cart?.itemCount ?? 0;
}

// ---------------------------------------------------------------------------
// Mutations — server actions
// ---------------------------------------------------------------------------
export interface AddToCartInput {
  variantId: string;
  quantity: number;
}

export async function addToCart({ variantId, quantity }: AddToCartInput): Promise<CartView | null> {
  const session = await getSession();
  if (!session) return null;

  const admin = await createSupabaseServiceRoleClient();
  const supabase = await createSupabaseServerClient();

  // Validate variant and read its price.
  const { data: variant } = await admin
    .from('product_variants')
    .select('id, product_id, price_override_cents, is_active, product:products ( price_cents, currency, is_active )')
    .eq('id', variantId)
    .maybeSingle();

  if (!variant || !variant.is_active) throw new Error('Variant unavailable');

  type V = {
    id: string;
    product_id: string;
    price_override_cents: number | null;
    is_active: boolean;
    product: { price_cents: number; currency: string; is_active: boolean } | null;
  };
  const v = variant as unknown as V;
  if (!v.product?.is_active) throw new Error('Product unavailable');

  const unitPriceCents = v.price_override_cents ?? v.product.price_cents;
  const currency = v.product.currency;

  const cart = await getOrCreateCartForUser(session.user.id);

  // Check existing line.
  const { data: existing } = await supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('cart_id', cart.id)
    .eq('variant_id', variantId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('cart_items')
      .update({ quantity: existing.quantity + quantity })
      .eq('id', existing.id);
  } else {
    await supabase.from('cart_items').insert({
      cart_id: cart.id,
      variant_id: variantId,
      quantity,
      unit_price_cents: unitPriceCents,
      currency,
    });
  }

  // Refresh activity timestamp + totals.
  await supabase
    .from('carts')
    .update({ last_activity_at: new Date().toISOString() })
    .eq('id', cart.id);

  revalidatePath('/bag');
  revalidatePath('/account');
  return getCartForCurrentUser();
}

export async function updateCartItemQuantity(itemId: string, quantity: number): Promise<void> {
  if (quantity <= 0) {
    await removeCartItem(itemId);
    return;
  }

  const session = await getSession();
  if (!session) return;

  const supabase = await createSupabaseServerClient();
  // RLS will deny if this item does not belong to the current user.
  await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', itemId);
  revalidatePath('/bag');
}

export async function removeCartItem(itemId: string): Promise<void> {
  const session = await getSession();
  if (!session) return;
  const supabase = await createSupabaseServerClient();
  await supabase.from('cart_items').delete().eq('id', itemId);
  revalidatePath('/bag');
}

export async function clearCart(): Promise<void> {
  const session = await getSession();
  if (!session) return;
  const supabase = await createSupabaseServerClient();
  const cart = await getOrCreateCartForUser(session.user.id);
  await supabase.from('cart_items').delete().eq('cart_id', cart.id);
  revalidatePath('/bag');
}
