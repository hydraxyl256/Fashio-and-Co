import { createSupabaseServerClient } from '@/lib/supabase/server';
import { CheckoutInfoClient } from '@/components/storefront/checkout/checkout-info-client';
import type { Metadata } from 'next';

async function getCartItems() {
  return [];
}

async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export const metadata: Metadata = {
  title: 'Checkout | FASHION & CO.',
};

export default async function CheckoutPage() {
  const [user, cartItems] = await Promise.all([
    getCurrentUser(),
    getCartItems(),
  ]);

  return <CheckoutInfoClient user={user} cartItems={cartItems} />;
}
