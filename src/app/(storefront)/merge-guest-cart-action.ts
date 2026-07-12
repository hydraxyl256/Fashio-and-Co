'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { getSession } from '@/lib/auth/session';
import {
  addToCart,
  getOrCreateCartForUser,
} from '@/lib/queries/cart';

const GUEST_COOKIE = 'fc_guest_cart';

interface GuestItem {
  variantId: string;
  quantity: number;
}

interface GuestPayload {
  v?: number;
  items?: GuestItem[];
}

/**
 * Read the guest cart from the cookie set by the client helper,
 * merge each item into the signed-in user's persistent cart, then
 * clear the cookie. Safe to call on every page load — it's a no-op
 * for guests or empty carts.
 */
export async function mergeGuestCartAction(): Promise<{ ok: boolean; merged: number }> {
  const session = await getSession();
  if (!session) return { ok: true, merged: 0 };

  const jar = await cookies();
  const raw = jar.get(GUEST_COOKIE)?.value;
  if (!raw) return { ok: true, merged: 0 };

  let payload: GuestPayload;
  try {
    payload = JSON.parse(decodeURIComponent(raw)) as GuestPayload;
  } catch {
    jar.delete(GUEST_COOKIE);
    return { ok: true, merged: 0 };
  }

  const items = Array.isArray(payload.items) ? payload.items : [];
  if (items.length === 0) {
    jar.delete(GUEST_COOKIE);
    return { ok: true, merged: 0 };
  }

  await getOrCreateCartForUser(session.user.id);

  let merged = 0;
  for (const item of items) {
    if (!item?.variantId || !item.quantity || item.quantity < 1) continue;
    const result = await addToCart({ variantId: item.variantId, quantity: item.quantity });
    if (result) merged += 1;
  }

  jar.delete(GUEST_COOKIE);
  revalidatePath('/bag');
  revalidatePath('/');
  return { ok: true, merged };
}
