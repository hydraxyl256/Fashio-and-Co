'use client';

import { UseFormReturn } from 'react-hook-form';
import { CheckoutFormData } from '@/lib/checkout/validation';
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';

interface CheckoutStepTermsProps {
  form: UseFormReturn<CheckoutFormData>;
}

export function CheckoutStepTerms({ form }: CheckoutStepTermsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Terms & Conditions</h2>
        <p className="text-gray-600">Please review and accept our policies</p>
      </div>

      <FormField
        control={form.control}
        name="acceptTerms"
        render={({ field }) => (
          <FormItem className="flex items-start gap-3">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                I agree to the{' '}
                <a href="/terms" className="underline hover:text-gray-600" target="_blank">
                  Terms & Conditions
                </a>
              </label>
              <p className="text-sm text-gray-600">
                Please read and accept our terms of service to proceed
              </p>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="acceptPrivacy"
        render={({ field }) => (
          <FormItem className="flex items-start gap-3">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                I agree to the{' '}
                <a href="/privacy" className="underline hover:text-gray-600" target="_blank">
                  Privacy Policy
                </a>
              </label>
              <p className="text-sm text-gray-600">
                We'll use your information according to our privacy policy
              </p>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-4">
        <div className="p-4 bg-amber-50 rounded border border-amber-200">
          <p className="text-sm text-amber-900">
            <strong>📧 Optional:</strong> Receive order updates and exclusive offers via email
          </p>
        </div>

        <div className="p-4 bg-gray-50 rounded border border-gray-200">
          <h3 className="font-medium text-sm mb-3">Order Information</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              ✓ Your order will be processed immediately after payment confirmation
            </p>
            <p>✓ You'll receive shipping details within 24 hours</p>
            <p>✓ Track your package in real-time</p>
            <p>✓ Free returns within 30 days</p>
          </div>
        </div>
      </div>
    </div>
  );
}
