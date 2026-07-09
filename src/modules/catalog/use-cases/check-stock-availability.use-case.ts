import { findVariantById } from '../repositories';

/**
 * Check Stock Availability Use-Case
 *
 * Verifies whether a specific variant has sufficient stock for a requested quantity.
 * Used by the checkout module before placing an order.
 */
export async function checkStockAvailability(variantId: string, requestedQuantity: number) {
  const variant = await findVariantById(variantId);

  if (!variant) {
    return { available: false, reason: 'Variant not found' };
  }

  if (!variant.isActive) {
    return { available: false, reason: 'This variant is no longer available' };
  }

  if (variant.stockQuantity < requestedQuantity) {
    return {
      available: false,
      reason: `Only ${variant.stockQuantity} units available`,
      currentStock: variant.stockQuantity,
    };
  }

  return {
    available: true,
    currentStock: variant.stockQuantity,
    variant,
  };
}
