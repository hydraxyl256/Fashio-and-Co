import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  BarChart3,
  Boxes,
  ClipboardList,
  Home,
  Layers,
  LogOut,
  Package,
  Settings,
  Shield,
  Tag,
  Truck,
  Users,
  Wallet,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { signOutAction } from '@/app/(auth)/actions';
import { requireStaffOrAdmin } from '@/lib/auth/session';
import { cn } from '@/lib/utils';

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  admin?: boolean;
  staff?: boolean;
};

const NAV: NavItem[] = [
  { href: '/admin', label: 'Overview', icon: BarChart3, exact: true },
  { href: '/admin/orders', label: 'Orders', icon: ClipboardList, staff: true },
  { href: '/admin/products', label: 'Products', icon: Boxes, staff: true },
  { href: '/admin/inventory', label: 'Inventory', icon: Package, staff: true },
  { href: '/admin/categories', label: 'Categories', icon: Layers, staff: true },
  { href: '/admin/collections', label: 'Collections', icon: Tag, staff: true },
  { href: '/admin/delivery', label: 'Delivery', icon: Truck, staff: true },
  { href: '/admin/discounts', label: 'Discounts', icon: Wallet, staff: true },
  { href: '/admin/homepage', label: 'Homepage', icon: Home, staff: true },
  { href: '/admin/customers', label: 'Customers', icon: Users, staff: true },
  { href: '/admin/staff', label: 'Staff & roles', icon: Shield, admin: true },
  { href: '/admin/audit', label: 'Audit log', icon: Settings, admin: true },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireStaffOrAdmin('/admin');
  if (session.role === 'customer') redirect('/account');

  return (
    <div className="min-h-[80vh] border-t border-border bg-muted/20">
      <div className="container-prose flex flex-col gap-8 py-10 lg:flex-row">
        <aside className="lg:w-64">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="eyebrow">Atelier</p>
              <p className="mt-1 font-serif text-xl">Admin</p>
              <p className="text-xs text-muted-foreground capitalize">{session.role}</p>
            </div>
            <form action={signOutAction}>
              <Button type="submit" variant="ghost" size="icon" aria-label="Sign out">
                <LogOut className="h-4 w-4" aria-hidden />
              </Button>
            </form>
          </div>

          <nav aria-label="Admin sections" className="mt-8">
            <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
              {NAV.map((item) => {
                if (item.admin && session.role !== 'admin') return null;
                const Icon = item.icon;
                return (
                  <li key={item.href} className="shrink-0">
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                      )}
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        <section className="min-w-0 flex-1 rounded-md border border-border bg-card p-6 lg:p-10">
          {children}
        </section>
      </div>
    </div>
  );
}
