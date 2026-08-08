import { pgTable, uuid, varchar, integer, index } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { orders } from './orders.schema';
import { products } from './products.schema';
import { variants } from './variants.schema';

/**
 * Order Items Table — Individual line items within an order.
 * Stores a snapshot of the product title, SKU, and unit price at the time of purchase
 * so that future product edits never corrupt historical order records.
 */
export const orderItems = pgTable(
  'order_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
    productId: uuid('product_id').references(() => products.id, { onDelete: 'set null' }),
    variantId: uuid('variant_id').references(() => variants.id, { onDelete: 'set null' }),
    title: varchar('title', { length: 500 }).notNull(),
    sku: varchar('sku', { length: 100 }),
    quantity: integer('quantity').notNull(),
    unitPriceInCents: integer('unit_price_in_cents').notNull(),
    totalPriceInCents: integer('total_price_in_cents').notNull(),
    imageUrl: varchar('image_url', { length: 512 }),
  },
  (table) => [
    index('idx_order_items_order_id').on(table.orderId),
    index('idx_order_items_variant_id').on(table.variantId),
  ]
);

export const insertOrderItemSchema = createInsertSchema(orderItems);
export const selectOrderItemSchema = createSelectSchema(orderItems);
export type OrderItem = z.infer<typeof selectOrderItemSchema>;
export type NewOrderItem = z.infer<typeof insertOrderItemSchema>;
