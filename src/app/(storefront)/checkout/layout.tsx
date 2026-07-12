import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { CheckoutProvider } from '@/components/storefront/checkout/checkout-context';

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return (
    <CheckoutProvider>
      <div className="min-h-screen bg-[#fef8fc] text-[#1d1b1e] font-montserrat selection:bg-[#f5d9ff] selection:text-[#30004a]">
      {/* Reduced Navigation (The Destination Rule: Minimal Shell for Checkout) */}
      <nav className="w-full bg-[#fef8fc] py-6 px-6 md:px-20 border-b border-[#cfc2d1]/30 sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto flex justify-between items-center">
          <Link href="/" className="font-playfair text-[24px] font-semibold tracking-tighter text-[#430562]">
            FASHION & CO.
          </Link>
          <Link href="/bag" className="flex items-center gap-2 font-montserrat text-[14px] font-semibold uppercase tracking-wider text-[#4d444f] hover:text-[#430562] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Bag</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-[1440px] mx-auto px-6 md:px-20 py-12 md:py-16 min-h-screen">
        {children}
      </main>

      {/* Footer (Reduced for Checkout Integrity) */}
      <footer className="w-full bg-white py-8 border-t border-[#cfc2d1]/20 mt-16">
        <div className="max-w-[1440px] mx-auto px-6 md:px-20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-montserrat text-[12px] font-medium text-[#4d444f]">&copy; 2024 FASHION & CO. All Rights Reserved.</p>
          <div className="flex gap-6 md:gap-8">
            <Link href="/privacy-terms" className="font-montserrat text-[12px] font-medium text-[#4d444f] hover:text-[#430562] transition-colors">Privacy Policy</Link>
            <Link href="/privacy-terms" className="font-montserrat text-[12px] font-medium text-[#4d444f] hover:text-[#430562] transition-colors">Terms of Service</Link>
            <Link href="/delivery-returns" className="font-montserrat text-[12px] font-medium text-[#4d444f] hover:text-[#430562] transition-colors">Shipping & Returns</Link>
          </div>
        </div>
      </footer>
    </div>
    </CheckoutProvider>
  );
}
