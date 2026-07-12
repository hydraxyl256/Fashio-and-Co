'use client';

import { UseFormReturn } from 'react-hook-form';
import { CheckoutFormData } from '@/lib/checkout/validation';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CheckoutStepPaymentProps {
  form: UseFormReturn<CheckoutFormData>;
}

export function CheckoutStepPayment({ form }: CheckoutStepPaymentProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Payment Method</h2>
        <p className="text-gray-600">
          We partner with Pesapal to securely process payments
        </p>
      </div>

      <FormField
        control={form.control}
        name="paymentMethod"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Choose Payment Method</FormLabel>
            <FormControl>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mpesa">
                    <div className="flex items-center gap-2">
                      <span>M-Pesa</span>
                      <span className="text-xs text-gray-500">Instant payment</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="card">
                    <div className="flex items-center gap-2">
                      <span>Credit/Debit Card</span>
                      <span className="text-xs text-gray-500">Visa, Mastercard</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="bank_transfer">
                    <div className="flex items-center gap-2">
                      <span>Bank Transfer</span>
                      <span className="text-xs text-gray-500">Direct bank payment</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="p-4 bg-green-50 rounded border border-green-200">
        <p className="text-sm font-medium text-green-900 mb-2">🔒 Secure Payment</p>
        <p className="text-sm text-green-800">
          Your payment information is encrypted and processed securely by Pesapal. We never
          store your card details.
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="font-medium text-sm">Payment Processing</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span>You'll be redirected to Pesapal to complete payment</span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span>Payment confirmation happens within seconds</span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span>You'll receive an order confirmation email immediately</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
