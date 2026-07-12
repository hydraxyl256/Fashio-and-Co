import { ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

const ICONS = {
  verified_user: ShieldCheck,
  local_shipping: Truck,
  published_with_changes: RefreshCw,
} as const;

export type TrustIconKey = keyof typeof ICONS;

interface TrustItem {
  key: TrustIconKey;
  title: string;
  body: string;
}

const DEFAULT_ITEMS: TrustItem[] = [
  {
    key: 'verified_user',
    title: 'Secure M-PESA Payments',
    body: 'Fully encrypted local and global transactions.',
  },
  {
    key: 'local_shipping',
    title: 'Express Nairobi Delivery',
    body: 'Same-day delivery within Nairobi metropolitan area.',
  },
  {
    key: 'published_with_changes',
    title: 'Hassle-Free Returns',
    body: '7-day easy exchange for all unworn garments.',
  },
];

interface TrustSectionProps {
  items?: TrustItem[];
  className?: string;
}

export function TrustSection({ items = DEFAULT_ITEMS, className }: TrustSectionProps) {
  return (
    <section className={cn('border-y border-[#cfc2d1]/30 py-12', className)} aria-label="Trust markers">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-[80px] grid grid-cols-1 md:grid-cols-3 gap-[64px] text-center">
        {items.map((item) => {
          const Icon = ICONS[item.key];
          return (
            <div key={item.key} className="flex flex-col items-center gap-4">
              <Icon className="text-[#430562] h-9 w-9" aria-hidden />
              <h5 className="font-montserrat text-[14px] font-semibold leading-[20px] tracking-[0.05em] uppercase text-[#1d1b1e]">
                {item.title}
              </h5>
              <p className="text-[#4d444f] font-montserrat text-[12px] font-medium leading-[16px] tracking-[0.03em]">
                {item.body}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
