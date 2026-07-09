import { VALID_ORDER_TRANSITIONS } from '../types';
import { findOrderById, updateOrderStatus } from '../repositories';
import type { TransitionOrderStatusInput } from '../types';
import type { OrderStatus } from '@/lib/db/schemas';

/**
 * Transition Order Status Use-Case
 *
 * Enforces the order state machine. Only valid transitions are allowed:
 *   pending -> payment_verified | cancelled
 *   payment_verified -> processing | cancelled | refunded
 *   processing -> shipped | cancelled
 *   shipped -> delivered
 *   delivered -> refunded
 *   cancelled / refunded -> (terminal, no transitions)
 */
export async function transitionOrderStatus(input: TransitionOrderStatusInput) {
  const order = await findOrderById(input.tenantId, input.orderId);

  if (!order) {
    throw new Error('Order not found');
  }

  const currentStatus = order.status as OrderStatus;
  const allowedTransitions = VALID_ORDER_TRANSITIONS[currentStatus];

  if (!allowedTransitions.includes(input.newStatus)) {
    throw new Error(
      `Invalid status transition: "${currentStatus}" -> "${input.newStatus}". ` +
        `Allowed transitions: [${allowedTransitions.join(', ')}]`
    );
  }

  const updated = await updateOrderStatus(input.tenantId, input.orderId, input.newStatus);

  return updated;
}
