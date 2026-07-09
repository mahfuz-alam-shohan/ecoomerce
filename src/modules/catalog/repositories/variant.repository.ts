import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { variants } from '@/lib/db/schemas';
import type { CreateVariantInput } from '../types';

/**
 * Variant Repository — Pure database queries for product variants.
 * Variants are scoped via their parent product's tenant ownership.
 */

export async function findVariantsByProduct(productId: string) {
  return db
    .select()
    .from(variants)
    .where(eq(variants.productId, productId))
    .orderBy(variants.title);
}

export async function findVariantById(variantId: string) {
  return db.query.variants.findFirst({
    where: eq(variants.id, variantId),
  });
}

export async function findVariantBySku(sku: string) {
  return db.query.variants.findFirst({
    where: eq(variants.sku, sku),
  });
}

export async function insertVariant(input: CreateVariantInput) {
  const [variant] = await db
    .insert(variants)
    .values({
      productId: input.productId,
      sku: input.sku,
      title: input.title,
      options: input.options,
      priceInCents: input.priceInCents,
      compareAtPriceInCents: input.compareAtPriceInCents,
      costPerItemInCents: input.costPerItemInCents,
      stockQuantity: input.stockQuantity,
      lowStockThreshold: input.lowStockThreshold,
      weight: input.weight,
      isDigital: input.isDigital,
    })
    .returning();

  return variant;
}

export async function insertVariantsBatch(inputs: CreateVariantInput[]) {
  if (inputs.length === 0) return [];

  return db
    .insert(variants)
    .values(
      inputs.map((input) => ({
        productId: input.productId,
        sku: input.sku,
        title: input.title,
        options: input.options,
        priceInCents: input.priceInCents,
        compareAtPriceInCents: input.compareAtPriceInCents,
        costPerItemInCents: input.costPerItemInCents,
        stockQuantity: input.stockQuantity,
        lowStockThreshold: input.lowStockThreshold,
        weight: input.weight,
        isDigital: input.isDigital,
      }))
    )
    .returning();
}

export async function updateVariantStock(variantId: string, newQuantity: number) {
  const [updated] = await db
    .update(variants)
    .set({ stockQuantity: newQuantity })
    .where(eq(variants.id, variantId))
    .returning();

  return updated;
}

export async function deleteVariantsByProduct(productId: string) {
  await db.delete(variants).where(eq(variants.productId, productId));
}
