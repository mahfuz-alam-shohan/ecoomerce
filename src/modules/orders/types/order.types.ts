import type { OrderStatus } from '@/lib/db/schemas';

/**
 * Orders Module — DTOs & Interfaces
 */

export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  customerName: string;
  totalAmountInCents: number;
  currency: string;
  itemCount: number;
  paymentMethod: string;
  createdAt: Date;
}

export interface TransitionOrderStatusInput {
  tenantId: string;
  orderId: string;
  newStatus: OrderStatus;
  notes?: string;
}

/**
 * Valid order status transitions enforced by the state machine.
 * Prevents illegal transitions (e.g., "delivered" -> "pending").
 */
export const VALID_ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['payment_verified', 'cancelled'],
  payment_verified: ['processing', 'cancelled', 'refunded'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: ['refunded'],
  cancelled: [],
  refunded: [],
};
