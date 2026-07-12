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
import { Input } from '@/components/ui/input';

interface CheckoutStepAddressProps {
  form: UseFormReturn<CheckoutFormData>;
}

export function CheckoutStepAddress({ form }: CheckoutStepAddressProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Shipping Address</h2>
        <p className="text-gray-600">Where should we deliver your order?</p>
      </div>

      <FormField
        control={form.control}
        name="recipientName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Recipient Name</FormLabel>
            <FormControl>
              <Input placeholder="Jane Doe" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="line1"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Street Address</FormLabel>
            <FormControl>
              <Input placeholder="123 Main Street" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="line2"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Apartment, suite, etc. (optional)</FormLabel>
            <FormControl>
              <Input placeholder="Apt 4B" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input placeholder="Nairobi" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="region"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Region (optional)</FormLabel>
              <FormControl>
                <Input placeholder="Westlands" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="postalCode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Postal Code (optional)</FormLabel>
            <FormControl>
              <Input placeholder="00100" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
