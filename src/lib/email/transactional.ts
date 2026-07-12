/**
 * Transactional email service using Resend.
 * Sends order confirmations, payment confirmations, and status updates.
 */

import { Resend } from 'resend';
import { serverEnv } from '@/lib/env';

const resend = new Resend(serverEnv.RESEND_API_KEY);

interface OrderConfirmationEmailParams {
  orderNumber: string;
  customerEmail: string;
  customerName: string | null;
  orderId: string;
}

interface PaymentConfirmationEmailParams {
  orderNumber: string;
  customerEmail: string;
  customerName: string | null;
  amount: number;
}

interface OrderStatusEmailParams {
  orderNumber: string;
  customerEmail: string;
  status: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

/**
 * Send order confirmation email.
 * Called immediately after order is created (before payment).
 */
export async function sendOrderConfirmationEmail(
  params: OrderConfirmationEmailParams,
): Promise<void> {
  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Order Confirmation</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.5; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #f0f0f0; }
      .logo { font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
      .content { padding: 30px 0; }
      .order-number { font-size: 14px; color: #666; margin: 10px 0; }
      .cta-button { display: inline-block; margin-top: 20px; padding: 12px 30px; background: #000; color: #fff; text-decoration: none; border-radius: 4px; }
      .footer { text-align: center; font-size: 12px; color: #999; border-top: 1px solid #f0f0f0; padding-top: 20px; margin-top: 30px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">Fashion & Co</div>
      </div>
      <div class="content">
        <h1>Thank you for your order!</h1>
        <p>Hi ${params.customerName || 'Valued Customer'},</p>
        <p>We've received your order and it's being processed. Your order confirmation details are below:</p>
        <div class="order-number">
          <strong>Order Number:</strong> ${params.orderNumber}
        </div>
        <p>You'll receive a payment confirmation email once your payment is processed. Visit your account to track your order or:</p>
        <a href="https://fashionandco.com/orders/${params.orderNumber}" class="cta-button">View Your Order</a>
      </div>
      <div class="footer">
        <p>Thank you for shopping with Fashion & Co. For questions, reply to this email.</p>
      </div>
    </div>
  </body>
</html>
  `;

  try {
    await resend.emails.send({
      from: serverEnv.RESEND_FROM_EMAIL,
      to: params.customerEmail,
      subject: `Order Confirmation: ${params.orderNumber}`,
      html,
    });
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
    throw error;
  }
}

/**
 * Send payment confirmation email.
 * Called after payment is successfully verified via webhook.
 */
export async function sendPaymentConfirmationEmail(
  params: PaymentConfirmationEmailParams,
): Promise<void> {
  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Payment Confirmed</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.5; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #f0f0f0; }
      .logo { font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
      .success-badge { display: inline-block; background: #10b981; color: #fff; padding: 8px 16px; border-radius: 4px; margin: 20px 0; }
      .amount { font-size: 24px; font-weight: 700; margin: 20px 0; }
      .content { padding: 30px 0; }
      .cta-button { display: inline-block; margin-top: 20px; padding: 12px 30px; background: #000; color: #fff; text-decoration: none; border-radius: 4px; }
      .footer { text-align: center; font-size: 12px; color: #999; border-top: 1px solid #f0f0f0; padding-top: 20px; margin-top: 30px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">Fashion & Co</div>
      </div>
      <div class="content">
        <div style="text-align: center;">
          <div class="success-badge">✓ Payment Confirmed</div>
        </div>
        <h1>Your payment has been received!</h1>
        <p>Hi ${params.customerName || 'Valued Customer'},</p>
        <p>Thank you. We've successfully received your payment for order <strong>${params.orderNumber}</strong>.</p>
        <div class="amount">KES ${(params.amount / 100).toFixed(2)}</div>
        <p>Your order is now being prepared and will ship soon. You'll receive a shipping update within 24 hours.</p>
        <a href="https://fashionandco.com/orders/${params.orderNumber}" class="cta-button">Track Your Order</a>
      </div>
      <div class="footer">
        <p>Questions? Contact us at support@fashionandco.com</p>
      </div>
    </div>
  </body>
</html>
  `;

  try {
    await resend.emails.send({
      from: serverEnv.RESEND_FROM_EMAIL,
      to: params.customerEmail,
      subject: `Payment Confirmed: ${params.orderNumber}`,
      html,
    });
  } catch (error) {
    console.error('Failed to send payment confirmation email:', error);
    throw error;
  }
}

/**
 * Send order status update email.
 * Called when order status changes (shipped, delivered, etc.).
 */
export async function sendOrderStatusEmail(
  params: OrderStatusEmailParams,
): Promise<void> {
  const statusMessages: Record<string, string> = {
    processing: 'Your order is being prepared',
    shipped: 'Your order has been shipped!',
    delivered: 'Your order has been delivered',
    cancelled: 'Your order has been cancelled',
  };

  const message = statusMessages[params.status] || `Your order status: ${params.status}`;

  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Order Update</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.5; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #f0f0f0; }
      .logo { font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
      .status-update { background: #f9fafb; padding: 20px; border-radius: 4px; margin: 20px 0; }
      .content { padding: 30px 0; }
      .cta-button { display: inline-block; margin-top: 20px; padding: 12px 30px; background: #000; color: #fff; text-decoration: none; border-radius: 4px; }
      .footer { text-align: center; font-size: 12px; color: #999; border-top: 1px solid #f0f0f0; padding-top: 20px; margin-top: 30px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">Fashion & Co</div>
      </div>
      <div class="content">
        <h1>Order Update</h1>
        <div class="status-update">
          <p><strong>${message}</strong></p>
          <p>Order: ${params.orderNumber}</p>
          ${params.trackingNumber ? `<p>Tracking Number: ${params.trackingNumber}</p>` : ''}
          ${params.estimatedDelivery ? `<p>Estimated Delivery: ${params.estimatedDelivery}</p>` : ''}
        </div>
        <a href="https://fashionandco.com/orders/${params.orderNumber}" class="cta-button">View Your Order</a>
      </div>
      <div class="footer">
        <p>Questions? Contact us at support@fashionandco.com</p>
      </div>
    </div>
  </body>
</html>
  `;

  try {
    await resend.emails.send({
      from: serverEnv.RESEND_FROM_EMAIL,
      to: params.customerEmail,
      subject: `Order Update: ${params.orderNumber}`,
      html,
    });
  } catch (error) {
    console.error('Failed to send order status email:', error);
    throw error;
  }
}
