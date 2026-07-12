/**
 * Payment provider abstraction types.
 *
 * This module defines the interface for payment providers, allowing clean
 * support for Pesapal, Flutterwave, and other gateways without tight coupling.
 */

export type PaymentProviderName = 'pesapal' | 'flutterwave';

export interface PaymentInitiationRequest {
  orderId: string;
  orderNumber: string;
  totalCents: number;
  currency: string;
  customerEmail: string;
  customerName: string | null;
  customerPhone: string | null;
  returnUrl: string;
  webhookUrl: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentInitiationResponse {
  redirectUrl: string;
  providerReference: string;
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface PaymentVerificationRequest {
  orderId: string;
  providerReference: string;
}

export interface PaymentVerificationResponse {
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  method?: string;
  amount?: number;
  currency?: string;
  transactionDate?: Date;
  metadata?: Record<string, unknown>;
}

export interface WebhookPayload {
  orderId: string;
  providerReference: string;
  status: 'completed' | 'failed' | 'cancelled';
  method?: string;
  amount?: number;
  currency?: string;
  timestamp: Date;
  rawPayload: unknown;
}

export interface PaymentProvider {
  /**
   * Initialize a payment with the provider.
   * Should return a redirect URL where the customer completes payment.
   */
  initializePayment(request: PaymentInitiationRequest): Promise<PaymentInitiationResponse>;

  /**
   * Verify payment status from the provider.
   * Used after redirect back from provider or via webhook.
   */
  verifyPayment(request: PaymentVerificationRequest): Promise<PaymentVerificationResponse>;

  /**
   * Validate and process a webhook callback from the provider.
   * Must verify authenticity and return parsed webhook data.
   */
  handleWebhook(
    payload: unknown,
    signature?: string,
  ): Promise<WebhookPayload | null>;

  /**
   * Cancel/refund a payment (placeholder for future use).
   */
  cancelPayment(orderId: string, reason?: string): Promise<void>;

  /**
   * Refund a payment (placeholder for future use).
   */
  refundPayment(orderId: string, amount?: number): Promise<void>;
}

/**
 * Provider registry to dynamically get provider instances.
 */
export const paymentProviders: Record<PaymentProviderName, PaymentProvider | undefined> = {
  pesapal: undefined,
  flutterwave: undefined,
};

export function registerPaymentProvider(
  name: PaymentProviderName,
  provider: PaymentProvider,
): void {
  paymentProviders[name] = provider;
}

export function getPaymentProvider(name: PaymentProviderName): PaymentProvider {
  const provider = paymentProviders[name];
  if (!provider) {
    throw new Error(`Payment provider '${name}' is not registered`);
  }
  return provider;
}
