'use client';

/**
 * Main checkout form component with multi-step flow.
 * Manages form state, validation, and step transitions.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { checkoutFormSchema, type CheckoutFormData } from '@/lib/checkout/validation';
import { initializeCheckout } from '@/app/(storefront)/checkout/actions';

import { CheckoutStepContact } from './checkout/steps/contact';
import { CheckoutStepAddress } from './checkout/steps/address';
import { CheckoutStepDelivery } from './checkout/steps/delivery';
import { CheckoutStepDiscount } from './checkout/steps/discount';
import { CheckoutStepPayment } from './checkout/steps/payment';
import { CheckoutStepTerms } from './checkout/steps/terms';
import { CheckoutOrderSummary } from './checkout/order-summary';

type CheckoutStep = 'contact' | 'address' | 'delivery' | 'discount' | 'payment' | 'terms';

const STEPS: CheckoutStep[] = ['contact', 'address', 'delivery', 'discount', 'payment', 'terms'];

interface CheckoutFormProps {
  isAuthenticated: boolean;
  initialEmail?: string;
  cartItems: Array<{ variantId: string; quantity: number }>;
  onSuccess?: (orderNumber: string) => void;
}

export function CheckoutForm({
  isAuthenticated,
  initialEmail,
  cartItems,
  onSuccess,
}: CheckoutFormProps) {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('contact');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [discountApplied, setDiscountApplied] = useState(false);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    mode: 'onChange',
    defaultValues: {
      email: initialEmail || '',
      phone: '',
      fullName: '',
      recipientName: '',
      line1: '',
      line2: '',
      city: '',
      region: '',
      postalCode: '',
      deliveryZoneId: '',
      deliveryRateId: '',
      discountCode: '',
      paymentMethod: 'mpesa',
      acceptTerms: false,
      acceptPrivacy: false,
    },
  });

  const currentStepIndex = STEPS.indexOf(currentStep);
  const isLastStep = currentStepIndex === STEPS.length - 1;
  const isFirstStep = currentStepIndex === 0;

  const handleNextStep = async () => {
    // Validate current step
    let fieldsToValidate: (keyof CheckoutFormData)[] = [];

    switch (currentStep) {
      case 'contact':
        fieldsToValidate = ['email', 'phone', 'fullName'];
        break;
      case 'address':
        fieldsToValidate = ['recipientName', 'line1', 'city'];
        break;
      case 'delivery':
        fieldsToValidate = ['deliveryZoneId', 'deliveryRateId'];
        break;
      case 'discount':
        // Optional step
        break;
      case 'payment':
        fieldsToValidate = ['paymentMethod'];
        break;
      case 'terms':
        fieldsToValidate = ['acceptTerms', 'acceptPrivacy'];
        break;
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (!isValid) {
      return;
    }

    // Move to next step
    if (!isLastStep) {
      const nextStepIndex = currentStepIndex + 1;
      setCurrentStep(STEPS[nextStepIndex]!);
    }
  };

  const handlePrevStep = () => {
    if (!isFirstStep) {
      const prevStepIndex = currentStepIndex - 1;
      setCurrentStep(STEPS[prevStepIndex]!);
    }
  };

  const handleSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true);

    try {
      const result = await initializeCheckout(data, cartItems);

      if (result.status === 'success' && result.data?.redirectUrl) {
        // Redirect to payment provider
        if (onSuccess) {
          onSuccess(result.data.orderNumber);
        }
        // Redirect after a brief delay to show success message
        setTimeout(() => {
          window.location.href = result.data!.redirectUrl!;
        }, 1000);
        toast.success('Redirecting to payment gateway...');
      } else {
        toast.error(result.message || 'Checkout failed. Please try again.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
      {/* Main form area */}
      <div className="md:col-span-2">
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          {/* Step: Contact */}
          {currentStep === 'contact' && (
            <CheckoutStepContact form={form} isAuthenticated={isAuthenticated} />
          )}

          {/* Step: Address */}
          {currentStep === 'address' && <CheckoutStepAddress form={form} />}

          {/* Step: Delivery */}
          {currentStep === 'delivery' && <CheckoutStepDelivery form={form} />}

          {/* Step: Discount */}
          {currentStep === 'discount' && (
            <CheckoutStepDiscount
              form={form}
              onApply={() => setDiscountApplied(true)}
            />
          )}

          {/* Step: Payment */}
          {currentStep === 'payment' && <CheckoutStepPayment form={form} />}

          {/* Step: Terms */}
          {currentStep === 'terms' && <CheckoutStepTerms form={form} />}

          {/* Navigation buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={isFirstStep}
              className="flex-1 px-6 py-3 text-center font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>

            {isLastStep ? (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 text-center font-medium text-white bg-black rounded hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Processing...' : 'Complete Purchase'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNextStep}
                className="flex-1 px-6 py-3 text-center font-medium text-white bg-black rounded hover:bg-gray-900"
              >
                Continue
              </button>
            )}
          </div>

          {/* Step indicator */}
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center text-xs text-gray-600">
              <span>
                Step {currentStepIndex + 1} of {STEPS.length}
              </span>
              <div className="flex gap-1">
                {STEPS.map((step, index) => (
                  <div
                    key={step}
                    className={`h-1 w-12 rounded ${
                      index <= currentStepIndex ? 'bg-black' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Order summary sidebar */}
      <div className="md:col-span-1">
        <CheckoutOrderSummary form={form} cartItems={cartItems} />
      </div>
    </div>
  );
}
