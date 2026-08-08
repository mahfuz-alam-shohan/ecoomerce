import { eq, and, ilike, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { products, type ProductStatus } from '@/lib/db/schemas';
import { withTenant } from '@/lib/db/tenant-context';
import type { CreateProductInput, UpdateProductInput } from '../types';

/**
 * Product Repository — Pure database queries for products.
 * All queries are strictly tenant-scoped via withTenant().
 */

export async function findProductsByTenant(
  tenantId: string,
  options?: { status?: ProductStatus; search?: string; limit?: number; offset?: number }
) {
  const conditions = [withTenant(tenantId, products.tenantId)];

  if (options?.status) {
    conditions.push(eq(products.status, options.status));
  }
  if (options?.search) {
    conditions.push(ilike(products.title, `%${options.search}%`));
  }

  return db
    .select()
    .from(products)
    .where(and(...conditions))
    .limit(options?.limit ?? 50)
    .offset(options?.offset ?? 0)
    .orderBy(products.createdAt);
}

export async function findProductById(tenantId: string, productId: string) {
  return db.query.products.findFirst({
    where: and(withTenant(tenantId, products.tenantId), eq(products.id, productId)),
  });
}

export async function findProductByHandle(tenantId: string, handle: string) {
  return db.query.products.findFirst({
    where: and(withTenant(tenantId, products.tenantId), eq(products.handle, handle)),
  });
}

export async function insertProduct(input: CreateProductInput) {
  const [product] = await db
    .insert(products)
    .values({
      tenantId: input.tenantId,
      categoryId: input.categoryId,
      title: input.title,
      handle: input.handle,
      description: input.description,
      productType: input.productType,
      images: input.images ?? [],
      dynamicSpecs: input.dynamicSpecs ?? {},
      tags: input.tags ?? [],
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
    })
    .returning();

  return product;
}

export async function updateProduct(tenantId: string, productId: string, input: UpdateProductInput) {
  const [updated] = await db
    .update(products)
    .set({ ...input, updatedAt: new Date() })
    .where(and(withTenant(tenantId, products.tenantId), eq(products.id, productId)))
    .returning();

  return updated;
}

export async function deleteProduct(tenantId: string, productId: string) {
  await db
    .delete(products)
    .where(and(withTenant(tenantId, products.tenantId), eq(products.id, productId)));
}

export async function countProductsByTenant(tenantId: string) {
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(products)
    .where(withTenant(tenantId, products.tenantId));

  return Number(result.count);
}
