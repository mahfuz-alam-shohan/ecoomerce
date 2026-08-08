import type { ICacheLockProvider } from '@/lib/adapters/cache';
import { db } from '@/lib/db';
import { variants } from '@/lib/db/schemas';
import { eq, and, gte, sql } from 'drizzle-orm';

/**
 * Reserve Inventory Use-Case (Standalone / Single Item)
 *
 * Acquires a distributed lock on the variant SKU, verifies stock availability,
 * and atomically decrements the stock quantity via SQL `gte` guard.
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
    const [updatedVariant] = await db
      .update(variants)
      .set({ stockQuantity: sql`${variants.stockQuantity} - ${quantity}` })
      .where(and(eq(variants.id, variantId), gte(variants.stockQuantity, quantity)))
      .returning();

    if (!updatedVariant) {
      throw new Error(`Insufficient stock. The requested quantity is not available.`);
    }

    return updatedVariant;
  } finally {
    await cache.releaseLock(lockKey);
  }
}
