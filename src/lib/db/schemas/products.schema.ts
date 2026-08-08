import { pgTable, uuid, varchar, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { tenants } from './tenants.schema';
import { categories } from './categories.schema';

export const productStatuses = ['draft', 'active', 'archived'] as const;
export type ProductStatus = (typeof productStatuses)[number];

export const productTypes = ['physical', 'digital', 'service', 'customizable'] as const;
export type ProductType = (typeof productTypes)[number];

/**
 * Products Table — Core catalog entity with dynamic JSONB specs.
 * Supports physical goods (shoes, electronics), digital downloads,
 * service listings, and customizable products (print-on-demand).
 * Dynamic specs via JSONB allow infinite extensibility without schema migration.
 */
export const products = pgTable(
  'products',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
    categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
    title: varchar('title', { length: 500 }).notNull(),
    handle: varchar('handle', { length: 500 }).notNull(),
    description: text('description'),
    productType: varchar('product_type', { length: 50 }).$type<ProductType>().default('physical').notNull(),
    status: varchar('status', { length: 50 }).$type<ProductStatus>().default('draft').notNull(),
    images: jsonb('images').$type<string[]>().default([]).notNull(),
    dynamicSpecs: jsonb('dynamic_specs').$type<Record<string, string>>().default({}).notNull(),
    tags: jsonb('tags').$type<string[]>().default([]).notNull(),
    seoTitle: varchar('seo_title', { length: 255 }),
    seoDescription: varchar('seo_description', { length: 500 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_products_tenant_id').on(table.tenantId),
    index('idx_products_tenant_status').on(table.tenantId, table.status),
    index('idx_products_handle').on(table.handle),
  ]
);

export const insertProductSchema = createInsertSchema(products);
export const selectProductSchema = createSelectSchema(products);
export type Product = z.infer<typeof selectProductSchema>;
export type NewProduct = z.infer<typeof insertProductSchema>;
