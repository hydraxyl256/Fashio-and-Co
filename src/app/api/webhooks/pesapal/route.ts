/**
 * Pesapal webhook endpoint for payment callbacks.
 * 
 * This endpoint must be:
 * - Idempotent: same webhook can be retried without side effects
 * - Secure: verify webhook signature and payment status
 * - Fast: respond quickly to Pesapal
 * - Reliable: log all events for debugging
 */

import { headers } from 'next/headers';
import { createSupabaseServiceRoleClient } from '@/lib/supabase/admin';
import { verifyPesapalSignature } from '@/lib/payments/pesapal';
import { serverEnv } from '@/lib/env';
import { sendOrderConfirmationEmail } from '@/lib/email/transactional';

interface PesapalWebhookBody {
  OrderTrackingId: string;
  OrderMerchantReference: string;
  TransactionAmount: string;
  TransactionCurrency: string;
  TransactionStatus: string;
  TransactionStatusDescription: string;
  TransactionType: string;
  TransactionTimestamp: string;
}

/**
 * Convert stock reservations to inventory movements.
 * Only called after payment is confirmed.
 */
async function convertReservationsToSale(
  orderId: string,
  performedBy?: string,
): Promise<void> {
  const supabase = await createSupabaseServiceRoleClient();

  // Get all reservations for this order
  const { data: reservations, error: resError } = await supabase
    .from('stock_reservations')
    .select('id, variant_id, quantity')
    .eq('order_id', orderId)
    .is('released_at', null);

  if (resError) {
    throw new Error(`Failed to fetch reservations: ${resError.message}`);
  }

  if (!reservations || reservations.length === 0) {
    return; // No reservations to convert
  }

  // Create inventory movements for each reserved item
  const movements = reservations.map((res) => ({
    variant_id: res.variant_id,
    delta: -res.quantity, // Negative = sale
    reason: 'sale' as const,
    order_id: orderId,
    performed_by: performedBy,
    note: `Payment confirmed for order ${orderId}`,
  }));

  const { error: movementError } = await supabase
    .from('inventory_movements')
    .insert(movements);

  if (movementError) {
    throw new Error(`Failed to create inventory movements: ${movementError.message}`);
  }

  // Update available_quantity on variants
  for (const reservation of reservations) {
    const { error: updateError } = await supabase
      .from('product_variants')
      .update({
        available_quantity: await supabase.rpc('decrement_available_quantity', {
          variant_id: reservation.variant_id,
          quantity: reservation.quantity,
        }),
      })
      .eq('id', reservation.variant_id);

    if (updateError) {
      console.error(`Failed to update variant ${reservation.variant_id}:`, updateError);
    }
  }

  // Mark reservations as released
  const { error: releaseError } = await supabase
    .from('stock_reservations')
    .update({ released_at: new Date().toISOString() })
    .in(
      'id',
      reservations.map((r) => r.id),
    );

  if (releaseError) {
    console.error('Failed to release reservations:', releaseError);
  }
}

/**
 * Record order status change in history.
 */
async function recordOrderStatusChange(
  orderId: string,
  fromStatus: string,
  toStatus: string,
  note?: string,
): Promise<void> {
  const supabase = await createSupabaseServiceRoleClient();

  const { error } = await supabase
    .from('order_status_history')
    .insert({
      order_id: orderId,
      from_status: fromStatus,
      to_status: toStatus,
      note,
      changed_by: null, // Webhook automated
    });

  if (error) {
    console.error('Failed to record status change:', error);
  }
}

/**
 * Check if a payment has already been processed.
 * Used to ensure idempotency.
 */
async function isPaymentAlreadyProcessed(
  orderId: string,
  providerReference: string,
): Promise<boolean> {
  const supabase = await createSupabaseServiceRoleClient();

  const { data: payment } = await supabase
    .from('payments')
    .select('id, status')
    .eq('order_id', orderId)
    .eq('provider_reference', providerReference)
    .single();

  // If payment status is already 'paid' or 'cancelled', we've processed it
  return payment?.status === 'paid' || payment?.status === 'cancelled';
}

/**
 * Handle successful payment.
 */
async function handlePaymentSuccess(
  orderId: string,
  providerReference: string,
): Promise<void> {
  const supabase = await createSupabaseServiceRoleClient();

  // Update payment status
  const { error: paymentError } = await supabase
    .from('payments')
    .update({
      status: 'paid',
      updated_at: new Date().toISOString(),
    })
    .eq('order_id', orderId)
    .eq('provider_reference', providerReference);

  if (paymentError) {
    throw new Error(`Failed to update payment: ${paymentError.message}`);
  }

  // Get order details
  const { data: order, error: orderFetchError } = await supabase
    .from('orders')
    .select('id, order_number, status, customer_email, customer_full_name')
    .eq('id', orderId)
    .single();

  if (orderFetchError || !order) {
    throw new Error('Failed to fetch order');
  }

  // Only process if still in pending_payment status
  if (order.status === 'pending_payment') {
    // Convert stock reservations to sales
    await convertReservationsToSale(orderId);

    // Update order status to paid
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateError) {
      throw new Error(`Failed to update order status: ${updateError.message}`);
    }

    // Record status change
    await recordOrderStatusChange(orderId, 'pending_payment', 'paid', 'Payment confirmed via webhook');

    // Send confirmation email
    try {
      await sendOrderConfirmationEmail({
        orderNumber: order.order_number,
        customerEmail: order.customer_email,
        customerName: order.customer_full_name,
        orderId,
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't throw - email failure shouldn't block webhook success
    }
  }
}

/**
 * Handle failed or cancelled payment.
 */
async function handlePaymentFailure(
  orderId: string,
  providerReference: string,
  reason: string,
): Promise<void> {
  const supabase = await createSupabaseServiceRoleClient();

  // Update payment status
  const { error: paymentError } = await supabase
    .from('payments')
    .update({
      status: 'failed',
      updated_at: new Date().toISOString(),
    })
    .eq('order_id', orderId)
    .eq('provider_reference', providerReference);

  if (paymentError) {
    console.error('Failed to update payment status:', paymentError);
  }

  // Get order details
  const { data: order } = await supabase
    .from('orders')
    .select('id, status')
    .eq('id', orderId)
    .single();

  if (!order) {
    return;
  }

  // Release stock reservations
  const { error: releaseError } = await supabase
    .from('stock_reservations')
    .update({ released_at: new Date().toISOString() })
    .eq('order_id', orderId)
    .is('released_at', null);

  if (releaseError) {
    console.error('Failed to release reservations:', releaseError);
  }

  // Only update order if still pending payment
  if (order.status === 'pending_payment') {
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        internal_note: `Payment failed: ${reason}`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Failed to cancel order:', updateError);
    }

    // Record status change
    await recordOrderStatusChange(orderId, 'pending_payment', 'cancelled', reason);
  }
}

/**
 * POST /api/webhooks/pesapal
 * Handle Pesapal payment confirmation webhook.
 */
export async function POST(request: Request) {
  // Get request headers for signature verification
  const headersList = await headers();
  const signature = headersList.get('x-pesapal-signature');
  const body = await request.text();

  const logEntry = {
    timestamp: new Date().toISOString(),
    signature,
    bodyLength: body.length,
  };

  try {
    // Parse webhook body
    let payload: PesapalWebhookBody;
    try {
      payload = JSON.parse(body);
    } catch (parseError) {
      console.error('Failed to parse webhook body:', parseError, logEntry);
      return new Response('Invalid JSON', { status: 400 });
    }

    const {
      OrderTrackingId,
      OrderMerchantReference,
      TransactionStatus,
      TransactionStatusDescription,
    } = payload;

    if (!OrderTrackingId || !OrderMerchantReference) {
      console.error('Missing required webhook fields', { payload, logEntry });
      return new Response('Missing required fields', { status: 400 });
    }

    // Verify signature
    if (signature) {
      const isValid = verifyPesapalSignature(
        OrderTrackingId,
        signature,
        serverEnv.PESAPAL_CONSUMER_SECRET,
      );

      if (!isValid) {
        console.error('Invalid webhook signature', logEntry);
        return new Response('Invalid signature', { status: 401 });
      }
    }

    // Check if we've already processed this payment (idempotency)
    const alreadyProcessed = await isPaymentAlreadyProcessed(
      OrderMerchantReference,
      OrderTrackingId,
    );

    if (alreadyProcessed) {
      console.log('Webhook already processed (idempotency)', {
        ...logEntry,
        orderId: OrderMerchantReference,
        trackingId: OrderTrackingId,
      });
      return new Response('OK', { status: 200 });
    }

    // Route based on payment status
    if (TransactionStatus === 'COMPLETED') {
      await handlePaymentSuccess(OrderMerchantReference, OrderTrackingId);
      console.log('Payment successful', {
        ...logEntry,
        orderId: OrderMerchantReference,
        trackingId: OrderTrackingId,
      });
    } else if (TransactionStatus === 'FAILED' || TransactionStatus === 'CANCELLED') {
      await handlePaymentFailure(
        OrderMerchantReference,
        OrderTrackingId,
        TransactionStatusDescription,
      );
      console.log('Payment failed', {
        ...logEntry,
        orderId: OrderMerchantReference,
        trackingId: OrderTrackingId,
        reason: TransactionStatusDescription,
      });
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook processing error:', error, logEntry);
    return new Response('Internal Server Error', { status: 500 });
  }
}
