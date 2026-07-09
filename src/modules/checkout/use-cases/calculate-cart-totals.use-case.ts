import type { CartItem, CartTotals } from '../types';

/**
 * Calculate Cart Totals Use-Case
 *
 * Computes subtotal, tax, shipping, discounts, and final total
 * for a set of cart items based on tenant-specific configuration.
 */
export function calculateCartTotals(
  items: CartItem[],
  config: { taxRatePercent: number; shippingInCents: number; freeShippingThresholdCents: number; currency: string }
): CartTotals {
  const subtotalInCents = items.reduce((sum, item) => sum + item.unitPriceInCents * item.quantity, 0);

  const taxInCents = Math.round((subtotalInCents * config.taxRatePercent) / 100);

  // Free shipping if subtotal exceeds threshold
  const shippingInCents =
    config.freeShippingThresholdCents > 0 && subtotalInCents >= config.freeShippingThresholdCents
      ? 0
      : config.shippingInCents;

  const discountInCents = 0; // Placeholder for future coupon/promotion engine

  const totalInCents = subtotalInCents + taxInCents + shippingInCents - discountInCents;

  return {
    items,
    subtotalInCents,
    taxInCents,
    shippingInCents,
    discountInCents,
    totalInCents,
    currency: config.currency,
  };
}
