import { db } from '@/lib/db';
import { orders, orderItems, transactions, variants, type TransactionStatus } from '@/lib/db/schemas';
import { eq, and, gte, inArray, sql } from 'drizzle-orm';
import { generateOrderNumber } from '@/lib/utils';
import { placeOrderValidator } from '../validators';
import { calculateCartTotals } from './calculate-cart-totals.use-case';
import { ManualPaymentAdapter } from '@/lib/adapters/payment/manual-payment.adapter';
import { SandboxPaymentAdapter } from '@/lib/adapters/payment/sandbox-payment.adapter';
import type { PlaceOrderInput, PlaceOrderResult } from '../types';
import type { IPaymentGateway } from '@/lib/adapters/payment/payment.interface';

/**
 * Place Order Use-Case — Atomic, Secure, Ultra-Efficient Order Pipeline
 *
 * 1. Validate input via Zod
 * 2. Batch-fetch true server-side prices from database (`inArray`) to prevent CWE-602 price spoofing
 * 3. Calculate verified totals (subtotal, tax, shipping)
 * 4. Execute atomic database transaction (`db.transaction`):
 *    - Atomically decrement variant stock with `gte(stockQuantity, quantity)` check
 *    - Create `order`, `order_items`, and `transaction` records
 *    - Roll back automatically if stock is insufficient or gateway fails
 */
export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const validated = placeOrderValidator.parse(input);

  // Step 1: Batch-fetch true database variants (1 query instead of N+1)
  const variantIds = validated.items.map((item) => item.variantId);
  const dbVariants = await db.query.variants.findMany({
    where: inArray(variants.id, variantIds),
  });
  const variantMap = new Map(dbVariants.map((v) => [v.id, v]));

  // Step 2: Verify stock availability & enforce server-side database price override
  const verifiedItems = validated.items.map((item) => {
    const variant = variantMap.get(item.variantId);
    if (!variant) throw new Error(`Product item "${item.title}" could not be found.`);
    if (variant.stockQuantity < item.quantity) {
      throw new Error(`Insufficient stock for "${variant.title}". Only ${variant.stockQuantity} available.`);
    }
    return {
      ...item,
      unitPriceInCents: variant.priceInCents, // Forcefully override client price with server price!
    };
  });

  // Step 3: Calculate totals from verified server prices
  const totals = calculateCartTotals(verifiedItems, {
    taxRatePercent: 5,
    shippingInCents: 500,
    freeShippingThresholdCents: 10000,
    currency: 'USD',
  });

  const orderNumber = generateOrderNumber();

  // Step 4: Atomic database transaction
  return await db.transaction(async (tx) => {
    // Atomically decrement stock with gte condition (prevents TOCTOU race conditions)
    for (const item of verifiedItems) {
      const [updated] = await tx
        .update(variants)
        .set({ stockQuantity: sql`${variants.stockQuantity} - ${item.quantity}` })
        .where(and(eq(variants.id, item.variantId), gte(variants.stockQuantity, item.quantity)))
        .returning();

      if (!updated) {
        throw new Error(`Insufficient stock for "${item.title}". Another customer just purchased this item.`);
      }
    }

    // Insert Order
    const [order] = await tx
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

    // Insert Order Items with verified prices
    await tx.insert(orderItems).values(
      verifiedItems.map((item) => ({
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

    // Process Payment via Gateway Adapter
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

    const transactionStatus: TransactionStatus =
      paymentResult.status === 'completed' ? 'approved' : 'pending';

    // Insert Transaction Record
    const [transaction] = await tx
      .insert(transactions)
      .values({
        orderId: order.id,
        provider: validated.paymentMethod,
        providerTransactionId: paymentResult.transactionId,
        amountInCents: totals.totalInCents,
        currency: totals.currency,
        status: transactionStatus,
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
  });
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
