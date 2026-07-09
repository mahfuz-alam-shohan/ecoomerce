import { pgTable, uuid, varchar, integer, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { tenants } from './tenants.schema';

/**
 * Categories Table — Hierarchical taxonomy for product organization.
 * Supports nested categories via parentId (self-referencing foreign key).
 * Each category is tenant-scoped for strict multi-tenant isolation.
 */
export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  parentId: uuid('parent_id'), // Self-referencing for nested tree
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull(),
  description: varchar('description', { length: 1000 }),
  imageUrl: varchar('image_url', { length: 512 }),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const insertCategorySchema = createInsertSchema(categories);
export const selectCategorySchema = createSelectSchema(categories);
export type Category = z.infer<typeof selectCategorySchema>;
export type NewCategory = z.infer<typeof insertCategorySchema>;
