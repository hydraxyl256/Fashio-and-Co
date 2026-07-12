'use server';

/**
 * Server actions for checkout and order management.
 * All payment and order creation operations are server-side only.
 * This ensures we never trust client-side payment confirmations.
 */

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseServiceRoleClient } from '@/lib/supabase/admin';
import { serverEnv, publicEnv } from '@/lib/env';
import { createPesapalProvider } from '@/lib/payments/pesapal';
import { registerPaymentProvider } from '@/lib/payments/types';
import { checkoutFormSchema, type CheckoutFormData } from '@/lib/checkout/validation';

// Initialize payment provider at module load
registerPaymentProvider(
  'pesapal',
  createPesapalProvider(
    serverEnv.PESAPAL_CONSUMER_KEY,
    serverEnv.PESAPAL_CONSUMER_SECRET,
    true, // sandbox mode
  ),
);

export type CheckoutResult = {
  status: 'success' | 'error';
  message: string;
  data?: {
    orderId: string;
    orderNumber: string;
    redirectUrl?: string;
  };
  fieldErrors?: Record<string, string[]>;
};

interface CartItem {
  variantId: string;
  quantity: number;
}

/**
 * Generate a unique order number in format: FC-YYYY-000001
 */
async function generateOrderNumber(): Promise<string> {
  const supabase = await createSupabaseServiceRoleClient();

  // Get the last order number for this year
  const year = new Date().getFullYear();
  const prefix = `FC-${year}-`;

  const { data: lastOrder } = await supabase
    .from('orders')
    .select('order_number')
    .like('order_number', `${prefix}%`)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  let sequence = 1;
  if (lastOrder) {
    const match = lastOrder.order_number.match(/(\d+)$/);
    if (match && match[1]) {
      sequence = Number.parseInt(match[1]) + 1;
    }
  }

  return `${prefix}${String(sequence).padStart(6, '0')}`;
}

/**
 * Validate that all products in cart have sufficient stock.
 */
async function validateStockAvailability(
  items: CartItem[],
): Promise<{ valid: boolean; errors: string[] }> {
  const supabase = await createSupabaseServiceRoleClient();
  const errors: string[] = [];

  for (const item of items) {
    const { data: variant } = await supabase
      .from('product_variants')
      .select(
        `
        id,
        sku,
        available_quantity,
        products (name)
      `,
      )
      .eq('id', item.variantId)
      .single();

    if (!variant) {
      errors.push(`Product variant not found: ${item.variantId}`);
      continue;
    }

    const qty = variant.available_quantity as any as number;
    if (!qty || qty < item.quantity) {
      errors.push(
        `Insufficient stock for ${(variant.products as any)?.name || 'product'} (${variant.sku})`,
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Create a short-lived stock reservation.
 * Reduces overselling during payment processing.
 * Expires after 30 minutes if payment is not completed.
 */
async function createStockReservations(
  orderId: string,
  items: CartItem[],
): Promise<void> {
  const supabase = await createSupabaseServiceRoleClient();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now

  const reservations = items.map((item) => ({
    variant_id: item.variantId,
    order_id: orderId,
    quantity: item.quantity,
    expires_at: expiresAt.toISOString(),
  }));

  const { error } = await supabase
    .from('stock_reservations')
    .insert(reservations);

  if (error) {
    throw new Error(`Failed to create stock reservations: ${error.message}`);
  }
}

/**
 * Create an order in pending_payment status.
 * All customer, address, and product data is denormalized into immutable snapshots.
 */
async function createOrder(
  formData: CheckoutFormData,
  cartItems: CartItem[],
  userId: string | null,
): Promise<string> {
  const supabase = await createSupabaseServiceRoleClient();

  // Fetch cart items with pricing
  const { data: variants } = await supabase
    .from('product_variants')
    .select(
      `
      id,
      sku,
      size,
      color,
      material,
      metal,
      gemstone,
      price_cents,
      product:products (id, name, slug),
      product_images (url)
    `,
    )
    .in(
      'id',
      cartItems.map((i) => i.variantId),
    );

  if (!variants || variants.length === 0) {
    throw new Error('No valid cart items found');
  }

  // Calculate order totals
  let subtotal = 0;
  const orderItems = cartItems.map((cartItem) => {
    const variant = variants.find((v) => v.id === cartItem.variantId)!;
    const price = variant.price_cents as any as number;
    const lineTotal = price * cartItem.quantity;
    subtotal += lineTotal;
    return {
      variant_id: variant.id,
      product_id: (variant.product as any)?.id,
      product_name: (variant.product as any)?.name || 'Unknown Product',
      product_slug: (variant.product as any)?.slug,
      variant_title: [variant.color, variant.size]
        .filter(Boolean)
        .join(' · '),
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      material: variant.material,
      metal: variant.metal,
      gemstone: variant.gemstone,
      image_url: (variant.product_images as any)?.[0]?.url,
      quantity: cartItem.quantity,
      unit_price_cents: price,
      line_total_cents: lineTotal,
    };
  });

  // Apply discount if provided
  let discount = 0;
  if (formData.discountCode) {
    const { data: discountCode } = await supabase
      .from('discount_codes')
      .select('kind, value, min_subtotal_cents, max_redemptions, redemptions_count')
      .eq('code', formData.discountCode.toUpperCase())
      .eq('is_active', true)
      .single();

    if (discountCode) {
      // Validate discount
      if (
        discountCode.min_subtotal_cents &&
        subtotal < discountCode.min_subtotal_cents
      ) {
        throw new Error(
          `Discount code requires minimum order of KES ${(discountCode.min_subtotal_cents / 100).toFixed(2)}`,
        );
      }

      if (
        discountCode.max_redemptions &&
        discountCode.redemptions_count >= discountCode.max_redemptions
      ) {
        throw new Error('This discount code has reached its redemption limit');
      }

      // Calculate discount amount
      if (discountCode.kind === 'percentage') {
        discount = Math.floor((subtotal * discountCode.value) / 10000);
      } else {
        discount = Math.min(discountCode.value, subtotal); // Don't exceed subtotal
      }
    }
  }

  // Get delivery rate
  const { data: deliveryRate } = await supabase
    .from('delivery_rates')
    .select(
      `
      id,
      price_cents,
      name,
      delivery_zones (id, name)
    `,
    )
    .eq('id', formData.deliveryRateId)
    .single();

  if (!deliveryRate) {
    throw new Error('Invalid delivery rate selected');
  }

  // Calculate totals
  const shippingCents = deliveryRate.price_cents;
  const total = subtotal - discount + shippingCents;

  // Create order
  const orderNumber = await generateOrderNumber();

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      user_id: userId,
      customer_email: formData.email,
      customer_full_name: formData.fullName,
      customer_phone: formData.phone,
      shipping_recipient_name: formData.recipientName,
      shipping_phone: formData.phone,
      shipping_line1: formData.line1,
      shipping_line2: formData.line2 || null,
      shipping_city: formData.city,
      shipping_region: formData.region || null,
      shipping_postal_code: formData.postalCode || null,
      shipping_country: 'KE',
      delivery_zone_id: formData.deliveryZoneId,
      delivery_rate_id: deliveryRate.id,
      delivery_zone_name: (deliveryRate.delivery_zones as any)?.name,
      delivery_rate_name: deliveryRate.name,
      delivery_price_cents: shippingCents,
      currency: 'KES',
      subtotal_cents: subtotal,
      discount_cents: discount,
      shipping_cents: shippingCents,
      tax_cents: 0,
      total_cents: total,
      applied_discount_code: formData.discountCode?.toUpperCase() || null,
      status: 'pending_payment',
    })
    .select()
    .single();

  if (orderError) {
    throw new Error(`Failed to create order: ${orderError.message}`);
  }

  if (!order) {
    throw new Error('Order creation returned no data');
  }

  // Create order items
  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(
      orderItems.map((item) => ({
        order_id: order.id,
        variant_id: item.variant_id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_slug: item.product_slug,
        variant_title: item.variant_title,
        sku: item.sku,
        size: item.size,
        color: item.color,
        material: item.material,
        metal: item.metal,
        gemstone: item.gemstone,
        image_url: item.image_url,
        quantity: item.quantity,
        unit_price_cents: item.unit_price_cents,
        line_total_cents: item.line_total_cents,
        currency: 'KES',
      })) as any,
    );

  if (itemsError) {
    throw new Error(`Failed to create order items: ${itemsError.message}`);
  }

  // Create stock reservations
  await createStockReservations(order.id, cartItems);

  // Record discount redemption if applicable
  if (formData.discountCode) {
    const { data: discountCode } = await supabase
      .from('discount_codes')
      .select('id')
      .eq('code', formData.discountCode.toUpperCase())
      .single();

    if (discountCode) {
      await supabase
        .from('discount_redemptions')
        .insert({
          discount_id: discountCode.id,
          user_id: userId,
          order_id: order.id,
        });

      // Increment redemption counter
      await (supabase as any).rpc('increment_discount_redemptions', {
        discount_id: discountCode.id,
      });
    }
  }

  return order.id;
}

/**
 * Initialize payment for an order.
 * Creates the order in pending_payment status and initiates payment with provider.
 */
export async function initializeCheckout(
  formData: unknown,
  cartItems: CartItem[],
): Promise<CheckoutResult> {
  try {
    // Validate form data
    const validatedData = checkoutFormSchema.parse(formData);

    // Get current user
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Validate stock availability
    const stockValidation = await validateStockAvailability(cartItems);
    if (!stockValidation.valid) {
      return {
        status: 'error',
        message: stockValidation.errors[0] || 'Stock validation failed',
      };
    }

    // Create order
    const orderId = await createOrder(validatedData, cartItems, user?.id || null);

    // Get order details
    const supabaseAdmin = await createSupabaseServiceRoleClient();
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, total_cents')
      .eq('id', orderId)
      .single();

    if (!order) {
      throw new Error('Failed to retrieve created order');
    }

    // Initialize payment with Pesapal
    const provider = require('@/lib/payments/types').getPaymentProvider('pesapal');

    const paymentResponse = await provider.initializePayment({
      orderId: order.id,
      orderNumber: order.order_number,
      totalCents: order.total_cents,
      currency: 'KES',
      customerEmail: validatedData.email,
      customerName: validatedData.fullName,
      customerPhone: validatedData.phone,
      returnUrl: `${publicEnv.NEXT_PUBLIC_SITE_URL}/checkout/confirmation?order=${order.order_number}`,
      webhookUrl: `${publicEnv.NEXT_PUBLIC_SITE_URL}/api/webhooks/pesapal`,
    });

    // Create payment record
    const { error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        order_id: order.id,
        provider: 'pesapal',
        provider_reference: paymentResponse.providerReference,
        amount_cents: order.total_cents,
        currency: 'KES',
        status: 'pending',
      });

    if (paymentError) {
      throw new Error(`Failed to record payment: ${paymentError.message}`);
    }

    return {
      status: 'success',
      message: 'Redirecting to payment gateway...',
      data: {
        orderId: order.id,
        orderNumber: order.order_number,
        redirectUrl: paymentResponse.redirectUrl,
      },
    };
  } catch (error) {
    console.error('Checkout error:', error);

    if (error instanceof Error) {
      if (error.message.includes('validation')) {
        return {
          status: 'error',
          message: error.message,
        };
      }
    }

    return {
      status: 'error',
      message: 'An error occurred during checkout. Please try again.',
    };
  }
}

/**
 * Validate a discount code.
 * Called when user enters a discount code during checkout.
 */
export async function validateDiscountCode(
  code: string,
): Promise<{ valid: boolean; discount?: number; message?: string }> {
  try {
    const supabase = await createSupabaseServiceRoleClient();

    const { data: discountCode, error } = await supabase
      .from('discount_codes')
      .select('id, kind, value, max_redemptions, redemptions_count, min_subtotal_cents')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !discountCode) {
      return {
        valid: false,
        message: 'Invalid or expired discount code',
      };
    }

    if (
      discountCode.max_redemptions &&
      discountCode.redemptions_count >= discountCode.max_redemptions
    ) {
      return {
        valid: false,
        message: 'This discount code has reached its redemption limit',
      };
    }

    return {
      valid: true,
      message: 'Discount code applied',
    };
  } catch (error) {
    console.error('Discount validation error:', error);
    return {
      valid: false,
      message: 'Failed to validate discount code',
    };
  }
}
