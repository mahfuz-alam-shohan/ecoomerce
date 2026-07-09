import type { PaymentMethod, ShippingAddress } from '@/lib/db/schemas';

/**
 * Checkout Module — DTOs & Interfaces
 */

export interface CartItem {
  variantId: string;
  productId: string;
  title: string;
  sku: string;
  quantity: number;
  unitPriceInCents: number;
  imageUrl?: string;
}

export interface CartTotals {
  items: CartItem[];
  subtotalInCents: number;
  taxInCents: number;
  shippingInCents: number;
  discountInCents: number;
  totalInCents: number;
  currency: string;
}

export interface PlaceOrderInput {
  tenantId: string;
  customerId?: string;
  customerEmail: string;
  customerName: string;
  items: CartItem[];
  paymentMethod: PaymentMethod;
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  notes?: string;
}

export interface PlaceOrderResult {
  orderId: string;
  orderNumber: string;
  transactionId: string;
  paymentStatus: string;
  paymentInstructions?: string;
  checkoutUrl?: string;
}
