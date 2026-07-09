import { pgTable, uuid, varchar, integer, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { tenants } from './tenants.schema';

/**
 * Attributes Table — Dynamic attribute taxonomy for filtering and search.
 * Allows merchants to define arbitrary filterable attributes like
 * "Color", "Size", "Brand", "RAM", "Warranty Period" per-tenant.
 * These are used to build dynamic storefront filter sidebars.
 */
export const attributes = pgTable('attributes', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).default('text').notNull(), // text | number | boolean | select
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const insertAttributeSchema = createInsertSchema(attributes);
export const selectAttributeSchema = createSelectSchema(attributes);
export type Attribute = z.infer<typeof selectAttributeSchema>;
export type NewAttribute = z.infer<typeof insertAttributeSchema>;
