import type { Metadata } from 'next';
import { CheckoutPaymentClient } from '@/components/storefront/checkout/checkout-payment-client';

export const metadata: Metadata = {
  title: 'Delivery & Payment | FASHION & CO.',
};

export default function CheckoutPaymentPage() {
  return <CheckoutPaymentClient />;
}
