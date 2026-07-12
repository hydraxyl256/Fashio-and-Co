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

interface CheckoutStepContactProps {
  form: UseFormReturn<CheckoutFormData>;
  isAuthenticated: boolean;
}

export function CheckoutStepContact({
  form,
  isAuthenticated,
}: CheckoutStepContactProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Contact Information</h2>
        <p className="text-gray-600">
          {isAuthenticated
            ? "We'll use this to keep you updated on your order"
            : 'Create an account or continue as guest'}
        </p>
      </div>

      <FormField
        control={form.control}
        name="fullName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Full Name</FormLabel>
            <FormControl>
              <Input
                placeholder="Jane Doe"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email Address</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder="jane@example.com"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phone Number</FormLabel>
            <FormControl>
              <Input
                placeholder="+254 712 345 678"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
