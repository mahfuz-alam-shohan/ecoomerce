import { randomUUID } from 'crypto';
import type {
  IPaymentGateway,
  PaymentCheckoutPayload,
  PaymentCheckoutResult,
  PaymentVerificationResult,
  PaymentRefundResult,
} from './payment.interface';

/**
 * Sandbox Payment Adapter — Built-in Mock Payment Simulator.
 *
 * Provides a fully functional fake payment gateway for end-to-end testing.
 * Simulates instant payment approval, rejection, and refund scenarios
 * so developers and merchants can test the entire checkout lifecycle
 * without needing real API keys or bank accounts.
 */
export class SandboxPaymentAdapter implements IPaymentGateway {
  readonly providerId = 'sandbox';
  readonly displayName = 'Sandbox Payment Simulator';

  async createCheckoutSession(payload: PaymentCheckoutPayload): Promise<PaymentCheckoutResult> {
    const transactionId = `sandbox_${randomUUID()}`;

    // Simulate instant successful payment
    return {
      transactionId,
      status: 'completed',
      instructions: '[SANDBOX] Payment simulated successfully. This is a test transaction.',
    };
  }

  async verifyPayment(
    transactionId: string,
    payload?: { simulateFailure?: boolean }
  ): Promise<PaymentVerificationResult> {
    const shouldFail = payload?.simulateFailure ?? false;

    return {
      success: !shouldFail,
      amountPaidInCents: 0, // Amount comes from the order record
      status: shouldFail ? 'rejected' : 'approved',
      providerTransactionId: transactionId,
    };
  }

  async refundTransaction(
    transactionId: string,
    amountInCents: number,
    reason?: string
  ): Promise<PaymentRefundResult> {
    return {
      refundId: `sandbox_refund_${randomUUID()}`,
      amountRefundedInCents: amountInCents,
      status: 'refunded',
    };
  }
}
