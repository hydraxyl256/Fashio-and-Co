/**
 * Pesapal payment provider implementation.
 *
 * Pesapal is a Kenyan payment gateway supporting M-Pesa, card payments, bank transfers, etc.
 * This implementation uses OAuth2 for authentication and supports both sandbox and production.
 *
 * Docs: https://developer.pesapal.com/
 */

import { createHash, createHmac } from 'crypto';

import type {
  PaymentProvider,
  PaymentInitiationRequest,
  PaymentInitiationResponse,
  PaymentVerificationRequest,
  PaymentVerificationResponse,
  WebhookPayload,
} from './types';

interface PesapalConfig {
  consumerKey: string;
  consumerSecret: string;
  baseUrl: string; // https://cybqa.pesapal.com (sandbox) or https://pay.pesapal.com (production)
  isSandbox: boolean;
}

interface PesapalTokenResponse {
  token: string;
  expiresIn: number;
}

interface PesapalOrderResponse {
  order_tracking_id: string;
  merchant_reference: string;
  redirect_url: string;
  error?: string;
}

interface PesapalTransactionStatus {
  order_tracking_id: string;
  merchant_reference: string;
  payment_method: string;
  amount: string;
  currency: string;
  status: string;
  payment_status_description: string;
  pesapal_transaction_tracking_id: string;
  pesapal_transaction_date: string;
  created_date: string;
}

/**
 * Global cache for Pesapal OAuth tokens (in production, use Redis).
 */
let cachedToken: { token: string; expiresAt: number } | null = null;

class PesapalProvider implements PaymentProvider {
  private config: PesapalConfig;

  constructor(config: PesapalConfig) {
    this.config = config;
  }

  /**
   * Get or refresh OAuth2 token from Pesapal.
   */
  private async getAuthToken(): Promise<string> {
    const now = Date.now();

    if (cachedToken && cachedToken.expiresAt > now) {
      return cachedToken.token;
    }

    const response = await fetch(`${this.config.baseUrl}/api/Auth/RequestToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        consumer_key: this.config.consumerKey,
        consumer_secret: this.config.consumerSecret,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Pesapal token request failed: ${response.status} ${response.statusText}`,
      );
    }

    const data = (await response.json()) as PesapalTokenResponse;

    // Cache token, expiring 30 seconds early for safety
    cachedToken = {
      token: data.token,
      expiresAt: now + (data.expiresIn - 30) * 1000,
    };

    return data.token;
  }

  async initializePayment(
    request: PaymentInitiationRequest,
  ): Promise<PaymentInitiationResponse> {
    const token = await this.getAuthToken();

    const payload = {
      id: `${request.orderNumber}-${Date.now()}`,
      currency: request.currency,
      amount: String((request.totalCents / 100).toFixed(2)),
      description: `Order ${request.orderNumber}`,
      callback_url: request.webhookUrl,
      redirect_mode: 'REDIRECT',
      customer_email: request.customerEmail,
      customer_first_name: request.customerName?.split(' ')[0] || 'Customer',
      customer_last_name: request.customerName?.split(' ').slice(1).join(' ') || '',
      customer_phone_number: request.customerPhone || '',
      billing_address: {
        email_address: request.customerEmail,
        phone_number: request.customerPhone || '',
        country_code: 'KE',
      },
      return_url: request.returnUrl,
    };

    const response = await fetch(`${this.config.baseUrl}/api/Transactions/InitiatePayment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Pesapal payment initialization failed: ${response.status} ${response.statusText} ${text}`,
      );
    }

    const data = (await response.json()) as PesapalOrderResponse;

    if (data.error) {
      throw new Error(`Pesapal payment error: ${data.error}`);
    }

    return {
      redirectUrl: data.redirect_url,
      providerReference: data.order_tracking_id,
      metadata: {
        merchantReference: data.merchant_reference,
      },
    };
  }

  async verifyPayment(
    request: PaymentVerificationRequest,
  ): Promise<PaymentVerificationResponse> {
    const token = await this.getAuthToken();

    const response = await fetch(
      `${this.config.baseUrl}/api/Transactions/GetTransactionStatus?orderTrackingId=${request.providerReference}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `Pesapal verification failed: ${response.status} ${response.statusText}`,
      );
    }

    const data = (await response.json()) as PesapalTransactionStatus;

    // Map Pesapal status to our standard status
    let status: PaymentVerificationResponse['status'] = 'pending';
    if (data.status === 'COMPLETED') {
      status = 'completed';
    } else if (data.status === 'FAILED') {
      status = 'failed';
    } else if (data.status === 'CANCELLED') {
      status = 'cancelled';
    }

    return {
      status,
      method: data.payment_method,
      amount: Number.parseFloat(data.amount),
      currency: data.currency,
      transactionDate: new Date(data.pesapal_transaction_date),
      metadata: {
        pesapalTrackingId: data.pesapal_transaction_tracking_id,
      },
    };
  }

  async handleWebhook(
    payload: unknown,
    signature?: string,
  ): Promise<WebhookPayload | null> {
    if (!payload || typeof payload !== 'object') {
      return null;
    }

    const data = payload as Record<string, unknown>;

    // Pesapal sends OrderTrackingId and reference in the webhook body
    const trackingId = String(data.OrderTrackingId || '');
    const reference = String(data.Reference || '');

    if (!trackingId || !reference) {
      return null;
    }

    // Verify the webhook signature using HMAC-SHA256
    // Pesapal sends X-Pesapal-Signature header
    if (signature) {
      const expectedSignature = createHmac('sha256', this.config.consumerSecret)
        .update(trackingId)
        .digest('base64');

      if (signature !== expectedSignature) {
        console.error('Pesapal webhook signature mismatch');
        return null;
      }
    }

    // Fetch the full transaction status from Pesapal to confirm
    const token = await this.getAuthToken();
    const response = await fetch(
      `${this.config.baseUrl}/api/Transactions/GetTransactionStatus?orderTrackingId=${trackingId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      console.error(
        `Pesapal webhook status check failed: ${response.status} ${response.statusText}`,
      );
      return null;
    }

    const txData = (await response.json()) as PesapalTransactionStatus;

    // Map status
    let status: WebhookPayload['status'] = 'failed';
    if (txData.status === 'COMPLETED') {
      status = 'completed';
    } else if (txData.status === 'CANCELLED') {
      status = 'cancelled';
    }

    return {
      orderId: reference, // We'll have stored the order ID in the merchant_reference
      providerReference: trackingId,
      status,
      method: txData.payment_method,
      amount: Number.parseFloat(txData.amount),
      currency: txData.currency,
      timestamp: new Date(txData.pesapal_transaction_date),
      rawPayload: payload,
    };
  }

  async cancelPayment(orderId: string, reason?: string): Promise<void> {
    // Placeholder for future implementation
    console.log(`Cancel payment for order ${orderId}: ${reason || 'No reason provided'}`);
  }

  async refundPayment(orderId: string, amount?: number): Promise<void> {
    // Placeholder for future implementation
    console.log(`Refund for order ${orderId}: ${amount ? `KES ${amount}` : 'Full refund'}`);
  }
}

/**
 * Create a Pesapal provider instance.
 * Use sandbox mode for development/testing.
 */
export function createPesapalProvider(
  consumerKey: string,
  consumerSecret: string,
  isSandbox = true,
): PaymentProvider {
  const baseUrl = isSandbox
    ? 'https://cybqa.pesapal.com'
    : 'https://pay.pesapal.com';

  return new PesapalProvider({
    consumerKey,
    consumerSecret,
    baseUrl,
    isSandbox,
  });
}

/**
 * Verify Pesapal webhook signature.
 * Used to confirm the webhook came from Pesapal.
 */
export function verifyPesapalSignature(
  orderTrackingId: string,
  signature: string,
  consumerSecret: string,
): boolean {
  const expectedSignature = createHmac('sha256', consumerSecret)
    .update(orderTrackingId)
    .digest('base64');

  return signature === expectedSignature;
}
