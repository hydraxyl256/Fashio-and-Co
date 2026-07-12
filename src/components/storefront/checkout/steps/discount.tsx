'use client';

import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { CheckoutFormData } from '@/lib/checkout/validation';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { validateDiscountCode } from '@/app/(storefront)/checkout/actions';
import { toast } from 'sonner';

interface CheckoutStepDiscountProps {
  form: UseFormReturn<CheckoutFormData>;
  onApply?: () => void;
}

export function CheckoutStepDiscount({ form, onApply }: CheckoutStepDiscountProps) {
  const [isValidating, setIsValidating] = useState(false);

  const handleValidateDiscount = async () => {
    const code = form.getValues('discountCode');

    if (!code || code.trim().length === 0) {
      toast.error('Please enter a discount code');
      return;
    }

    setIsValidating(true);

    try {
      const result = await validateDiscountCode(code);

      if (result.valid) {
        toast.success(result.message || 'Discount code applied!');
        onApply?.();
      } else {
        toast.error(result.message || 'Invalid discount code');
      }
    } catch (error) {
      console.error('Discount validation error:', error);
      toast.error('Failed to validate discount code');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Discount Code</h2>
        <p className="text-gray-600">Have a promo code? Enter it here (optional)</p>
      </div>

      <FormField
        control={form.control}
        name="discountCode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Discount Code</FormLabel>
            <FormControl>
              <div className="flex gap-2">
                <Input
                  placeholder="SUMMERSALE"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e.target.value.toUpperCase());
                  }}
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={handleValidateDiscount}
                  disabled={isValidating}
                  className="px-6 py-2 font-medium text-sm bg-gray-100 text-gray-900 rounded hover:bg-gray-200 disabled:opacity-50"
                >
                  {isValidating ? 'Checking...' : 'Apply'}
                </button>
              </div>
            </FormControl>
            <FormDescription>
              Enter your promo code to get a discount on this order
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="p-4 bg-blue-50 rounded border border-blue-200">
        <p className="text-sm text-blue-900">
          💡 Don't have a code? Check your email for promotional offers or sign up for our
          newsletter to get exclusive discounts.
        </p>
      </div>
    </div>
  );
}
