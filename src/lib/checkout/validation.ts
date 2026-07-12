/**
 * Validation schemas for checkout flow.
 * Using Zod for runtime validation with strong error messages.
 */

import { z } from 'zod';

/**
 * Validate customer contact details (email and phone).
 */
export const checkoutContactSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  phone: z
    .string()
    .min(9, 'Phone number is required (min 9 characters)')
    .max(15, 'Phone number must be 15 characters or less')
    .regex(/^[\d+\-\s()]+$/, 'Phone number contains invalid characters'),
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(120, 'Full name must be 120 characters or less'),
});

/**
 * Validate shipping address.
 */
export const checkoutAddressSchema = z.object({
  recipientName: z
    .string()
    .min(2, 'Recipient name must be at least 2 characters')
    .max(120),
  phone: z
    .string()
    .min(9, 'Phone number is required (min 9 characters)')
    .max(15, 'Phone number must be 15 characters or less')
    .regex(/^[\d+\-\s()]+$/, 'Phone number contains invalid characters'),
  line1: z.string().min(3, 'Street address is required').max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(2, 'City is required').max(100),
  region: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
});

/**
 * Validate delivery zone selection.
 */
export const checkoutDeliverySchema = z.object({
  deliveryZoneId: z.string().uuid('Invalid delivery zone'),
  deliveryRateId: z.string().uuid('Invalid delivery rate'),
});

/**
 * Validate discount code (flexible since validation happens server-side too).
 */
export const checkoutDiscountSchema = z.object({
  discountCode: z
    .string()
    .min(2, 'Discount code must be at least 2 characters')
    .max(50, 'Discount code is too long')
    .toUpperCase()
    .optional()
    .or(z.literal('')),
});

/**
 * Validate payment method selection.
 */
export const checkoutPaymentMethodSchema = z.object({
  paymentMethod: z
    .enum(['mpesa', 'card', 'bank_transfer'])
    .default('mpesa'),
});

/**
 * Validate terms and policy acknowledgement.
 */
export const checkoutTermsSchema = z.object({
  acceptTerms: z.boolean().refine((v) => v === true, {
    message: 'You must accept the terms and conditions',
  }),
  acceptPrivacy: z.boolean().refine((v) => v === true, {
    message: 'You must accept the privacy policy',
  }),
});

/**
 * Complete checkout form validation.
 */
export const checkoutFormSchema = checkoutContactSchema
  .merge(checkoutAddressSchema)
  .merge(checkoutDeliverySchema)
  .merge(checkoutDiscountSchema)
  .merge(checkoutPaymentMethodSchema)
  .merge(checkoutTermsSchema);

export type CheckoutContactInput = z.infer<typeof checkoutContactSchema>;
export type CheckoutAddressInput = z.infer<typeof checkoutAddressSchema>;
export type CheckoutDeliveryInput = z.infer<typeof checkoutDeliverySchema>;
export type CheckoutDiscountInput = z.infer<typeof checkoutDiscountSchema>;
export type CheckoutPaymentMethodInput = z.infer<typeof checkoutPaymentMethodSchema>;
export type CheckoutTermsInput = z.infer<typeof checkoutTermsSchema>;
export type CheckoutFormData = z.infer<typeof checkoutFormSchema>;

/**
 * Order lookup schema (for tracking page).
 */
export const orderLookupSchema = z.object({
  orderNumber: z
    .string()
    .min(1, 'Order number is required')
    .regex(/^[A-Z]{2,}-\d{4}-\d+$/, 'Invalid order number format'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
});

export type OrderLookupInput = z.infer<typeof orderLookupSchema>;
