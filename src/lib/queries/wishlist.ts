import 'server-only';

import { cache } from 'react';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/session';
import { revalidatePath } from 'next/cache';

export interface WishlistView {
  productIds: string[];
}

/** Get the signed-in user's wishlist, creating it lazily. */
async function getOrCreateWishlistForUser(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: existing } = await supabase
    .from('wishlists')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (existing) return existing;
  const { data: created, error } = await supabase
    .from('wishlists')
    .insert({ user_id: userId })
    .select('*')
    .single();
  if (error || !created) throw new Error('Could not create wishlist');
  return created;
}

export const getWishlistProductIds = cache(async (): Promise<string[]> => {
  const session = await getSession();
  if (!session) return [];
  const supabase = await createSupabaseServerClient();
  const wishlist = await getOrCreateWishlistForUser(session.user.id);
  const { data: items } = await supabase
    .from('wishlist_items')
    .select('product_id')
    .eq('wishlist_id', wishlist.id);
  return (items ?? []).map((i) => i.product_id);
});

export async function toggleWishlistItem(productId: string): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;
  const supabase = await createSupabaseServerClient();
  const wishlist = await getOrCreateWishlistForUser(session.user.id);

  const { data: existing } = await supabase
    .from('wishlist_items')
    .select('id')
    .eq('wishlist_id', wishlist.id)
    .eq('product_id', productId)
    .maybeSingle();

  if (existing) {
    await supabase.from('wishlist_items').delete().eq('id', existing.id);
  } else {
    await supabase
      .from('wishlist_items')
      .insert({ wishlist_id: wishlist.id, product_id: productId });
  }
  revalidatePath('/account/wishlist');
  return !existing;
}

export async function removeWishlistItem(productId: string): Promise<void> {
  const session = await getSession();
  if (!session) return;
  const supabase = await createSupabaseServerClient();
  const wishlist = await getOrCreateWishlistForUser(session.user.id);
  await supabase
    .from('wishlist_items')
    .delete()
    .eq('wishlist_id', wishlist.id)
    .eq('product_id', productId);
  revalidatePath('/account/wishlist');
}
