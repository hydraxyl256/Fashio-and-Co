/**
 * Guest cart — local storage backed.
 *
 * A signed-out shopper can add pieces to a local cart. On sign-in, the
 * server-side `mergeGuestCartAction` reads the guest cart from a cookie
 * (set by the client helper below) and merges its items into the user's
 * persistent cart.
 *
 * Storage shape (versioned for forward-compat):
 *   {
 *     v: 1,
 *     items: Array<{ variantId: string; quantity: number }>
 *   }
 */
import { toast } from 'sonner';

const STORAGE_KEY = 'fc_guest_cart_v1';
const COOKIE_NAME = 'fc_guest_cart';

export interface GuestCartItem {
  variantId: string;
  quantity: number;
}

interface GuestCart {
  v: 1;
  items: GuestCartItem[];
}

const empty: GuestCart = { v: 1, items: [] };

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readStorage(): GuestCart {
  if (!isBrowser()) return empty;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<GuestCart>;
    if (parsed.v !== 1 || !Array.isArray(parsed.items)) return empty;
    return {
      v: 1,
      items: parsed.items
        .filter(
          (i): i is GuestCartItem =>
            typeof i?.variantId === 'string' &&
            typeof i?.quantity === 'number' &&
            i.quantity > 0,
        )
        .map((i) => ({ variantId: i.variantId, quantity: Math.min(99, Math.max(1, i.quantity)) })),
    };
  } catch {
    return empty;
  }
}

function writeStorage(cart: GuestCart): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch {
    /* storage full or denied — silently ignore */
  }
  // Mirror into a cookie so the server-side merge action can read it on
  // sign-in. Keep it small and URL-encoded.
  const cookieValue = encodeURIComponent(JSON.stringify(cart));
  // 30 days
  document.cookie = `${COOKIE_NAME}=${cookieValue}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
  // Notify any listeners in the same tab that the cart changed.
  window.dispatchEvent(new Event('fc:guest-cart-changed'));
}

export function readGuestCart(): GuestCart {
  return readStorage();
}

export function addToGuestCart(variantId: string, quantity = 1): GuestCart {
  const cart = readStorage();
  const existing = cart.items.find((i) => i.variantId === variantId);
  if (existing) {
    existing.quantity = Math.min(99, existing.quantity + quantity);
  } else {
    cart.items.push({ variantId, quantity: Math.min(99, Math.max(1, quantity)) });
  }
  writeStorage(cart);
  return cart;
}

export function updateGuestCartItem(variantId: string, quantity: number): GuestCart {
  const cart = readStorage();
  if (quantity <= 0) {
    cart.items = cart.items.filter((i) => i.variantId !== variantId);
  } else {
    const existing = cart.items.find((i) => i.variantId === variantId);
    if (existing) existing.quantity = Math.min(99, quantity);
    else cart.items.push({ variantId, quantity: Math.min(99, quantity) });
  }
  writeStorage(cart);
  return cart;
}

export function removeFromGuestCart(variantId: string): GuestCart {
  return updateGuestCartItem(variantId, 0);
}

export function clearGuestCart(): void {
  writeStorage(empty);
  if (isBrowser()) {
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  }
}

export function getGuestCartCount(): number {
  return readStorage().items.reduce((sum, i) => sum + i.quantity, 0);
}

/**
 * Add to guest cart from a client component with toast feedback.
 * Used by the PDP "Add to bag" button when no session exists.
 */
export function addToGuestCartWithFeedback(variantId: string, productName: string): void {
  addToGuestCart(variantId, 1);
  toast.success(`Added to bag — ${productName}.`);
}
