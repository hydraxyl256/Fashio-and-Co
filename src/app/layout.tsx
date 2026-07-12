import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';

import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { AnnouncementBar } from '@/components/layout/announcement-bar';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeaderServer } from '@/components/layout/site-header-server';
import { GuestCartMerger } from '@/components/storefront/guest-cart-merger';
import { GuestCartSync } from '@/components/storefront/guest-cart-sync';

import './globals.css';

const instrument = localFont({
  src: [
    { path: '../../public/fonts/instrument-serif-regular.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/instrument-serif-italic.woff2', weight: '400', style: 'italic' },
  ],
  variable: '--font-instrument',
  display: 'swap',
  preload: true,
});

const manrope = localFont({
  src: [
    { path: '../../public/fonts/manrope-300.woff2', weight: '300', style: 'normal' },
    { path: '../../public/fonts/manrope-400.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/manrope-500.woff2', weight: '500', style: 'normal' },
    { path: '../../public/fonts/manrope-600.woff2', weight: '600', style: 'normal' },
    { path: '../../public/fonts/manrope-700.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-manrope',
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: 'Fashion & Co. — Nairobi Womenswear & Jewelry',
    template: '%s — Fashion & Co.',
  },
  description:
    'A Nairobi atelier of considered womenswear and hand-finished jewelry. Crafted slowly, sent with care.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_KE',
    siteName: 'Fashion & Co.',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FBF8F3' },
    { media: '(prefers-color-scheme: dark)', color: '#1B130E' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn(instrument.variable, manrope.variable)} suppressHydrationWarning>
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-foreground focus:px-3 focus:py-2 focus:text-background"
        >
          Skip to main content
        </a>
        <AnnouncementBar />
        <SiteHeaderServer />
        <main id="main" className="min-h-[60vh]">
          {children}
        </main>
        <SiteFooter />
        <GuestCartMerger />
        <GuestCartSync />
        <Toaster />
      </body>
    </html>
  );
}
