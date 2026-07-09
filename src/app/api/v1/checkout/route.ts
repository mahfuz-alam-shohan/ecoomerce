
import { NextRequest } from 'next/server';
import { placeOrder } from '@/modules/checkout/use-cases';
import { apiCreated, apiError } from '@/lib/utils';

/**
 * Checkout API — Public Storefront
 *
 * POST /api/v1/checkout
 * Body: { tenantId, customerEmail, customerName, items: [...], paymentMethod, shippingAddress }
 *
 * This is a PUBLIC endpoint (customers don't need dashboard auth).
 * The tenantId is injected by the storefront page from the resolved tenant context.
 *
 * Pipeline:
 *   1. Validate cart items and shipping address (Zod)
 *   2. Reserve inventory with concurrency lock (flash sale protection)
 *   3. Calculate totals (subtotal + tax + shipping)
 *   4. Create order, order_items, and transaction records
 *   5. Process payment via tenant's configured adapter (COD/Sandbox)
 *   6. Return order confirmation + payment instructions
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.tenantId) {
      return apiError('tenantId is required');
    }

    if (!body.items || body.items.length === 0) {
      return apiError('Cart must contain at least one item');
    }

    const result = await placeOrder(body);

    return apiCreated(result);
  } catch (err) {
    const message = (err as Error).message;

    // Inventory errors (stock unavailable, lock contention)
    if (message.includes('Insufficient stock') || message.includes('currently being purchased')) {
      return apiError(message, 409); // 409 Conflict
    }

    // Validation errors
    if ((err as any)?.name === 'ZodError') {
      return apiError(`Validation failed: ${(err as any).errors?.[0]?.message}`, 422);
    }

    console.error('[Checkout Error]', err);
    return apiError('Failed to process checkout', 500);
  }
}
