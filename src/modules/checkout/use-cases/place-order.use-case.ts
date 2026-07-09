import { db } from '@/lib/db';
import { orders, orderItems, transactions } from '@/lib/db/schemas';
import { generateOrderNumber } from '@/lib/utils';
import { placeOrderValidator } from '../validators';
import { calculateCartTotals } from './calculate-cart-totals.use-case';
import { reserveInventory } from './reserve-inventory.use-case';
import { MemoryCacheAdapter } from '@/lib/adapters/cache/memory-cache.adapter';
import { ManualPaymentAdapter } from '@/lib/adapters/payment/manual-payment.adapter';
import { SandboxPaymentAdapter } from '@/lib/adapters/payment/sandbox-payment.adapter';
import type { PlaceOrderInput, PlaceOrderResult } from '../types';
import type { IPaymentGateway } from '@/lib/adapters/payment/payment.interface';

const cache = new MemoryCacheAdapter();

/**
 * Place Order Use-Case — Atomic Order Creation Pipeline
 *
 * 1. Validate input via Zod
 * 2. Reserve inventory (with distributed locking)
 * 3. Calculate cart totals (subtotal, tax, shipping)
 * 4. Create order + order_items + transaction records
 * 5. Process payment via the tenant's configured gateway adapter
 * 6. Return order confirmation with payment instructions
 */
export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  // Step 1: Validate
  const validated = placeOrderValidator.parse(input);

  // Step 2: Reserve inventory for all items
  for (const item of validated.items) {
    await reserveInventory(item.variantId, item.quantity, cache);
  }

  // Step 3: Calculate totals
  const totals = calculateCartTotals(validated.items, {
    taxRatePercent: 5, // TODO: Pull from tenant's storeConfig
    shippingInCents: 500,
    freeShippingThresholdCents: 10000,
    currency: 'USD',
  });

  // Step 4: Create order record
  const orderNumber = generateOrderNumber();

  const [order] = await db
    .insert(orders)
    .values({
      tenantId: validated.tenantId,
      customerId: validated.customerId,
      orderNumber,
      status: 'pending',
      customerEmail: validated.customerEmail,
      customerName: validated.customerName,
      shippingAddress: validated.shippingAddress,
      billingAddress: validated.billingAddress || validated.shippingAddress,
      paymentMethod: validated.paymentMethod,
      subtotalInCents: totals.subtotalInCents,
      taxInCents: totals.taxInCents,
      shippingInCents: totals.shippingInCents,
      discountInCents: totals.discountInCents,
      totalAmountInCents: totals.totalInCents,
      currency: totals.currency,
      notes: validated.notes,
    })
    .returning();

  // Step 5: Create order items (snapshot prices at time of purchase)
  await db.insert(orderItems).values(
    validated.items.map((item) => ({
      orderId: order.id,
      productId: item.productId,
      variantId: item.variantId,
      title: item.title,
      sku: item.sku,
      quantity: item.quantity,
      unitPriceInCents: item.unitPriceInCents,
      totalPriceInCents: item.unitPriceInCents * item.quantity,
      imageUrl: item.imageUrl,
    }))
  );

  // Step 6: Process payment via adapter
  const gateway = resolvePaymentGateway(validated.paymentMethod);
  const paymentResult = await gateway.createCheckoutSession({
    orderId: order.id,
    orderNumber,
    tenantId: validated.tenantId,
    amountInCents: totals.totalInCents,
    currency: totals.currency,
    customerEmail: validated.customerEmail,
    customerName: validated.customerName || 'Guest',
  });

  // Step 7: Create transaction record
  const [transaction] = await db
    .insert(transactions)
    .values({
      orderId: order.id,
      provider: validated.paymentMethod,
      providerTransactionId: paymentResult.transactionId,
      amountInCents: totals.totalInCents,
      currency: totals.currency,
      status: paymentResult.status as any,
    })
    .returning();

  return {
    orderId: order.id,
    orderNumber,
    transactionId: transaction.id,
    paymentStatus: paymentResult.status,
    paymentInstructions: paymentResult.instructions,
    checkoutUrl: paymentResult.checkoutUrl,
  };
}

/** Resolve the payment gateway adapter based on method */
function resolvePaymentGateway(method: string): IPaymentGateway {
  switch (method) {
    case 'cod':
    case 'bank_transfer':
      return new ManualPaymentAdapter();
    case 'sandbox':
      return new SandboxPaymentAdapter();
    default:
      return new ManualPaymentAdapter();
  }
}
