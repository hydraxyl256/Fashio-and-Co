'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Search, User, Heart, ShoppingBag } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { BrandLogo } from '@/components/brand/brand-logo';
import { MobileNav } from '@/components/layout/mobile-nav';
import { CartDrawer } from '@/components/storefront/cart-drawer';
import { WishlistDrawer, type WishlistItem } from '@/components/storefront/wishlist-drawer';
import { SearchOverlay } from '@/components/storefront/search-overlay';
import { useCartStore } from '@/lib/store/cart-store';

const NAV_LINKS = [
  { label: 'Shop',         href: '/collections/shop' },
  { label: 'New Arrivals', href: '/collections/new' },
  { label: 'Clothing',     href: '/collections/category/womenswear' },
  { label: 'Jewelry',      href: '/collections/category/jewelry' },
  { label: 'About',        href: '/about' },
] as const;

interface SiteHeaderProps {
  wishlist: {
    items: WishlistItem[];
  } | null;
  signedIn: boolean;
}

export function SiteHeader({ wishlist, signedIn }: SiteHeaderProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const pathname = usePathname();
  
  const cartCount = useCartStore((s) => s.cart?.itemCount ?? 0);
  const isDrawerOpen = useCartStore((s) => s.isDrawerOpen);
  const setDrawerOpen = useCartStore((s) => s.setDrawerOpen);

  const wishlistCount = wishlist?.items.length ?? 0;

  // Stitch scroll shadow effect
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full bg-[#fef8fc] border-b border-[#cfc2d1]/30',
        'transition-shadow duration-300',
        scrolled && 'shadow-[0_4px_20px_-2px_rgba(61,23,79,0.08)]',
      )}
    >
      <div className="relative flex justify-between items-center w-full px-5 sm:px-10 lg:px-[80px] py-4 max-w-[1440px] mx-auto">
        {/* Brand — left, vertically centered. Real logo, no oversized treatment. */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden -ml-2"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu aria-hidden />
          </Button>
          <BrandLogo
            href="/"
            label="Fashion & Co. — Home"
            priority
            sizes="(max-width: 640px) 88px, (max-width: 1024px) 120px, 144px"
            className="h-8 sm:h-9 md:h-10"
          />
        </div>

        {/* Desktop Navigation — centered, label-md, uppercase, tracking-wider */}
        <nav aria-label="Primary" className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href + link.label}
                href={link.href}
                className={cn(
                  'font-montserrat text-[14px] font-semibold leading-[20px] uppercase tracking-wider transition-colors duration-300',
                  isActive
                    ? 'text-[#430562] border-b-2 border-[#430562] pb-1'
                    : 'text-[#4d444f] hover:text-[#430562]',
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Trailing Icons — search, account, wishlist, bag */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Search */}
          <Button
            variant="ghost"
            size="icon"
            className="text-[#1d1b1e] hover:text-[#430562] transition-colors"
            aria-label="Search"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search className="w-5 h-5" />
          </Button>

          {/* Account */}
          <Link
            href={signedIn ? '/account' : '/sign-in'}
            aria-label="Account"
            className="text-[#1d1b1e] hover:text-[#430562] transition-colors hidden sm:block"
          >
            <User className="w-5 h-5" />
          </Link>

          {/* Wishlist Drawer */}
          <WishlistDrawer items={wishlist?.items ?? []} signedIn={signedIn}>
            <Button
              variant="ghost"
              size="icon"
              className="text-[#1d1b1e] hover:text-[#430562] transition-colors relative hidden sm:flex"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#430562] text-[9px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Button>
          </WishlistDrawer>

          {/* Cart Drawer */}
          <CartDrawer open={isDrawerOpen} onOpenChange={setDrawerOpen}>
            <Button
              variant="ghost"
              size="icon"
              className="text-[#1d1b1e] hover:text-[#430562] transition-colors relative"
              aria-label="Shopping Bag"
              onClick={() => setDrawerOpen(true)}
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#430562] text-[9px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Button>
          </CartDrawer>
        </div>
      </div>

      <MobileNav
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        links={NAV_LINKS.map(({ label, href }) => ({ label, href }))}
      />

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}
