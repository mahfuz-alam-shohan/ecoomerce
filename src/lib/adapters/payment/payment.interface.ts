/**
 * IPaymentGateway — Modular Payment Adapter Interface
 *
 * All payment methods (Manual/COD, Bank Transfer, Sandbox Simulator,
 * future Stripe Connect, PayPal, etc.) implement this single interface.
 * The checkout module calls these methods without knowing which provider is active.
 */

export interface PaymentCheckoutPayload {
  orderId: string;
  orderNumber: string;
  tenantId: string;
  amountInCents: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentCheckoutResult {
  transactionId: string;
  status: 'pending' | 'completed' | 'requires_action';
  checkoutUrl?: string; // For redirect-based gateways (Stripe, PayPal)
  instructions?: string; // For manual gateways (bank details, COD info)
}

export interface PaymentVerificationResult {
  success: boolean;
  amountPaidInCents: number;
  status: 'approved' | 'rejected' | 'pending';
  providerTransactionId?: string;
}

export interface PaymentRefundResult {
  refundId: string;
  amountRefundedInCents: number;
  status: 'refunded' | 'partial_refund' | 'failed';
}

export interface IPaymentGateway {
  readonly providerId: string;
  readonly displayName: string;

  createCheckoutSession(payload: PaymentCheckoutPayload): Promise<PaymentCheckoutResult>;
  verifyPayment(transactionId: string, payload?: unknown): Promise<PaymentVerificationResult>;
  refundTransaction(transactionId: string, amountInCents: number, reason?: string): Promise<PaymentRefundResult>;
}
