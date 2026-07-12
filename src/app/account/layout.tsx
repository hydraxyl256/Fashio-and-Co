import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Package, MapPin, Heart, Settings, LayoutGrid } from 'lucide-react';

import { signOutAction } from '@/app/(auth)/actions';
import { getSession, getProfile } from '@/lib/auth/session';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/account', label: 'Overview', icon: LayoutGrid, exact: true },
  { href: '/account/profile', label: 'Profile', icon: Settings },
  { href: '/account/addresses', label: 'Addresses', icon: MapPin },
  { href: '/account/orders', label: 'Orders', icon: Package },
  { href: '/account/wishlist', label: 'Wishlist', icon: Heart },
] as const;

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/sign-in?next=/account');

  const profile = await getProfile(session.user.id);
  const firstName = profile?.full_name?.split(' ')[0] ?? 'Member';

  return <>{children}</>;
}
