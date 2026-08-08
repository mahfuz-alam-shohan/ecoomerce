import { pgTable, uuid, varchar, integer, boolean, jsonb, index } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { products } from './products.schema';

/**
 * Product Variants Table — SKU-level inventory and pricing.
 * Each product can have multiple variants (e.g., Red/Large, Blue/Small).
 * Options are stored as JSONB for maximum flexibility (any combination of
 * color, size, material, weight, etc.).
 * Digital assets metadata allows downloads for digital product variants.
 */
export const variants = pgTable(
  'product_variants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
    sku: varchar('sku', { length: 100 }).notNull().unique(),
    title: varchar('title', { length: 255 }).notNull(),
    options: jsonb('options').$type<Record<string, string>>().default({}).notNull(),
    priceInCents: integer('price_in_cents').notNull(),
    compareAtPriceInCents: integer('compare_at_price_in_cents'),
    costPerItemInCents: integer('cost_per_item_in_cents'),
    stockQuantity: integer('stock_quantity').default(0).notNull(),
    lowStockThreshold: integer('low_stock_threshold').default(5).notNull(),
    weight: integer('weight_grams'),
    isDigital: boolean('is_digital').default(false).notNull(),
    digitalAssetMeta: jsonb('digital_asset_meta').$type<{
      downloadUrl?: string;
      licenseType?: string;
      maxDownloads?: number;
    }>(),
    isActive: boolean('is_active').default(true).notNull(),
  },
  (table) => [
    index('idx_variants_product_id').on(table.productId),
  ]
);

export const insertVariantSchema = createInsertSchema(variants);
export const selectVariantSchema = createSelectSchema(variants);
export type Variant = z.infer<typeof selectVariantSchema>;
export type NewVariant = z.infer<typeof insertVariantSchema>;
