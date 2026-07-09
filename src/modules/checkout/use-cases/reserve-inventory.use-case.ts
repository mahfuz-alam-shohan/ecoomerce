import type { ICacheLockProvider } from '@/lib/adapters/cache';
import { findVariantById, updateVariantStock } from '@/modules/catalog/repositories';

/**
 * Reserve Inventory Use-Case
 *
 * Acquires a distributed lock on the variant SKU, verifies stock availability,
 * and atomically decrements the stock quantity.
 * Prevents double-selling during concurrent checkout (flash sales).
 */
export async function reserveInventory(
  variantId: string,
  quantity: number,
  cache: ICacheLockProvider
) {
  const lockKey = `inventory:${variantId}`;
  const lockAcquired = await cache.acquireLock(lockKey, 30); // 30-second lock TTL

  if (!lockAcquired) {
    throw new Error('This item is currently being purchased by another customer. Please try again.');
  }

  try {
    const variant = await findVariantById(variantId);

    if (!variant) {
      throw new Error('Variant not found');
    }

    if (variant.stockQuantity < quantity) {
      throw new Error(`Insufficient stock. Only ${variant.stockQuantity} available.`);
    }

    // Atomically decrement stock
    const updatedVariant = await updateVariantStock(variantId, variant.stockQuantity - quantity);

    return updatedVariant;
  } finally {
    await cache.releaseLock(lockKey);
  }
}
