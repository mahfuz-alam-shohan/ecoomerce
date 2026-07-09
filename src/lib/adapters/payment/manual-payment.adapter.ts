import type {
  IPaymentGateway,
  PaymentCheckoutPayload,
  PaymentCheckoutResult,
  PaymentVerificationResult,
  PaymentRefundResult,
} from './payment.interface';

/**
 * Manual Payment Adapter — Handles Cash on Delivery (COD) and Bank Transfer.
 *
 * When a customer selects COD or Bank Transfer at checkout:
 * 1. The order is created with status 'pending'.
 * 2. For Bank Transfer, instructions are returned to the customer.
 * 3. The merchant manually verifies payment (receipt upload / reference code)
 *    and approves the order from the dashboard.
 */
export class ManualPaymentAdapter implements IPaymentGateway {
  readonly providerId = 'manual';
  readonly displayName = 'Manual Payment (COD / Bank Transfer)';

  async createCheckoutSession(payload: PaymentCheckoutPayload): Promise<PaymentCheckoutResult> {
    const transactionId = crypto.randomUUID();

    return {
      transactionId,
      status: 'pending',
      instructions:
        'Your order has been placed successfully. ' +
        'Please complete payment via your selected method. ' +
        'The merchant will verify your payment and process your order.',
    };
  }

  async verifyPayment(
    transactionId: string,
    payload?: { approved: boolean; notes?: string }
  ): Promise<PaymentVerificationResult> {
    // In the manual flow, the merchant clicks "Approve" or "Reject" from the dashboard.
    // The payload contains the merchant's decision.
    const isApproved = payload?.approved ?? false;

    return {
      success: isApproved,
      amountPaidInCents: 0, // Amount is validated by the merchant
      status: isApproved ? 'approved' : 'rejected',
      providerTransactionId: transactionId,
    };
  }

  async refundTransaction(
    transactionId: string,
    amountInCents: number,
    reason?: string
  ): Promise<PaymentRefundResult> {
    // Manual refunds are tracked in the ledger; actual money movement is offline.
    return {
      refundId: crypto.randomUUID(),
      amountRefundedInCents: amountInCents,
      status: 'refunded',
    };
  }
}
