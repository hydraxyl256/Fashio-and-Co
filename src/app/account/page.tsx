import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { getSession, getProfile } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getWishlistProductIds } from '@/lib/queries/wishlist';
import { AccountOverviewClient } from '@/components/account/account-overview-client';

export const metadata: Metadata = { title: 'My Account | FASHION & CO.' };
export const revalidate = 0;

export default async function AccountOverviewPage() {
  const session = await getSession();
  if (!session) redirect('/sign-in?next=/account');
  
  const profile = await getProfile(session.user.id);
  const supabase = await createSupabaseServerClient();

  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, status, placed_at, total_cents, currency')
    .eq('user_id', session.user.id)
    .order('placed_at', { ascending: false })
    .limit(5);

  const wishlistIds = await getWishlistProductIds();

  return (
    <AccountOverviewClient
      profile={profile ? {
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone,
      } : null}
      recentOrders={orders ?? []}
      wishlistCount={wishlistIds.length}
    />
  );
}
