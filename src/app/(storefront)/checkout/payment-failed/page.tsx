import Link from 'next/link';
import type { Metadata } from 'next';
import { AlertCircle, Lock, ShoppingBag } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Payment Failed | FASHION & CO.',
};

export default function PaymentFailedPage() {
  return (
    <div className="min-h-screen bg-[#fef8fc] text-[#1d1b1e] font-montserrat flex flex-col">
      {/* TopNavBar (Mandatory Shell - Inactive/Suppressed state for Checkout) */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#fef8fc] border-b border-[#cfc2d1]/30">
        <div className="flex justify-between items-center w-full px-6 md:px-20 py-6 max-w-[1440px] mx-auto">
          <Link href="/" className="font-playfair text-[24px] font-semibold tracking-tighter text-[#430562]">
            FASHION & CO.
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/bag">
              <ShoppingBag className="w-5 h-5 text-[#4d444f] hover:text-[#430562] transition-colors" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-32 pb-24 px-6 md:px-20 flex items-center justify-center -mt-24">
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          
          {/* Left Column: Status Message */}
          <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ffdad6] text-[#93000a] font-montserrat text-[12px] uppercase tracking-widest font-semibold">
              <AlertCircle className="w-4 h-4" />
              <span>Payment Interrupted</span>
            </div>
            
            <h1 className="font-playfair text-[36px] md:text-[48px] text-[#430562] font-bold leading-tight">
              Something went <br />a little sideways.
            </h1>
            
            <div className="space-y-4 text-[#4d444f]">
              <p className="font-montserrat text-[18px]">
                We couldn't finalize your order due to an <strong className="text-[#430562] font-semibold">M-PESA timeout</strong> or card authorization failure. This usually happens if the payment prompt wasn't accepted in time or there's a temporary carrier delay.
              </p>
              <p className="font-montserrat text-[16px]">
                Don't worry, your selections are still reserved in your bag. Would you like to try the transaction again or choose a different method?
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="/checkout/payment"
                className="bg-[#430562] text-white px-8 py-4 font-montserrat text-[14px] font-semibold uppercase tracking-widest hover:bg-[#3d174f] transition-all duration-300 shadow-xl shadow-[#430562]/20 text-center active:scale-[0.98]"
              >
                Retry Payment
              </Link>
              <Link
                href="/contact"
                className="border border-[#430562] text-[#430562] px-8 py-4 font-montserrat text-[14px] font-semibold uppercase tracking-widest hover:bg-[#f8f2f6] transition-all duration-300 text-center active:scale-[0.98]"
              >
                Contact Support
              </Link>
            </div>
            
            <div className="pt-8 flex items-center gap-2 text-[#7e7480] text-[12px] font-montserrat">
              <Lock className="w-4 h-4" />
              <span>Secure encrypted checkout powered by Nairobi Excellence.</span>
            </div>
          </section>

          {/* Right Column: Visual Element / Decorative */}
          <section className="hidden md:block relative h-[500px] w-full bg-[#ece6eb] rounded-xl overflow-hidden shadow-xl shadow-[#430562]/10 border border-[#cfc2d1]/30">
            <img 
              src="https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800&q=80" 
              alt="Editorial presentation" 
              className="w-full h-full object-cover grayscale opacity-80 mix-blend-multiply" 
            />
            <div className="absolute inset-0 bg-[#430562]/10 backdrop-blur-[2px]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border-4 border-white/20 flex items-center justify-center backdrop-blur-md">
                <AlertCircle className="w-12 h-12 text-white/80" strokeWidth={1.5} />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
