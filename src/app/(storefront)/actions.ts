'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { getSession } from '@/lib/auth/session';
import {
  addToCart as addToCartQuery,
  clearCart as clearCartQuery,
  getCartForCurrentUser,
  removeCartItem as removeCartItemQuery,
  updateCartItemQuantity as updateCartItemQuantityQuery,
  type CartView,
} from '@/lib/queries/cart';
import { removeWishlistItem as removeWishlistQuery, toggleWishlistItem as toggleWishlistQuery } from '@/lib/queries/wishlist';

const addSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().min(1).max(50),
});

const updateSchema = z.object({
  itemId: z.string().uuid(),
  quantity: z.number().int().min(0).max(50),
});

export interface CartActionResult {
  ok: boolean;
  message?: string;
  cart?: CartView;
}

export async function addToCartAction(input: { variantId: string; quantity: number }): Promise<CartActionResult> {
  const session = await getSession();
  if (!session) return { ok: false, message: 'Please sign in to add pieces to your bag.' };
  const parsed = addSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: 'Invalid request' };

  try {
    const cart = await addToCartQuery(parsed.data);
    return { ok: true, cart: cart ?? undefined };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : 'Could not add to bag' };
  }
}

export async function updateCartItemAction(input: { itemId: string; quantity: number }): Promise<CartActionResult> {
  const session = await getSession();
  if (!session) return { ok: false, message: 'Please sign in.' };
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: 'Invalid request' };

  await updateCartItemQuantityQuery(parsed.data.itemId, parsed.data.quantity);
  const cart = await getCartForCurrentUser();
  revalidatePath('/bag');
  return { ok: true, cart: cart ?? undefined };
}

export async function removeCartItemAction(input: { itemId: string }): Promise<CartActionResult> {
  const session = await getSession();
  if (!session) return { ok: false, message: 'Please sign in.' };
  const parsed = z.object({ itemId: z.string().uuid() }).safeParse(input);
  if (!parsed.success) return { ok: false, message: 'Invalid request' };

  await removeCartItemQuery(parsed.data.itemId);
  const cart = await getCartForCurrentUser();
  revalidatePath('/bag');
  return { ok: true, cart: cart ?? undefined };
}

export async function clearCartAction(): Promise<CartActionResult> {
  const session = await getSession();
  if (!session) return { ok: false, message: 'Please sign in.' };
  await clearCartQuery();
  const cart = await getCartForCurrentUser();
  return { ok: true, cart: cart ?? undefined };
}

// ---------------------------------------------------------------------------
// Wishlist actions
// ---------------------------------------------------------------------------
export async function toggleWishlistAction(input: { productId: string }): Promise<{ ok: boolean; added: boolean }> {
  const session = await getSession();
  if (!session) return { ok: false, added: false };
  const parsed = z.object({ productId: z.string().uuid() }).safeParse(input);
  if (!parsed.success) return { ok: false, added: false };

  const added = await toggleWishlistQuery(parsed.data.productId);
  revalidatePath('/account/wishlist');
  return { ok: true, added };
}

export async function removeWishlistItemAction(input: { productId: string }): Promise<{ ok: boolean }> {
  const session = await getSession();
  if (!session) return { ok: false };
  const parsed = z.object({ productId: z.string().uuid() }).safeParse(input);
  if (!parsed.success) return { ok: false };

  await removeWishlistQuery(parsed.data.productId);
  revalidatePath('/account/wishlist');
  return { ok: true };
}
