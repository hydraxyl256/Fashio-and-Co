import type { Metadata } from 'next';
import { BagPageContent } from '@/components/storefront/bag-page-content';

export const metadata: Metadata = { title: 'Shopping Bag | FASHION & CO.' };

export default function BagPage() {
  return <BagPageContent />;
}
