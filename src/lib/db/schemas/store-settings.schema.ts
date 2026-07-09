import { pgTable, uuid, varchar, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { tenants } from './tenants.schema';

export interface ShippingRule {
  name: string;
  rateInCents: number;
  minOrderCents?: number;
  maxWeightGrams?: number;
}

export interface TaxRule {
  region: string;
  ratePercent: number;
}

/**
 * Store Settings Table — Extended tenant configuration for checkout, tax, and shipping.
 * Stored separately from the tenants table to keep the tenant entity focused on identity
 * and allow independent scaling of business configuration.
 */
export const storeSettings = pgTable('store_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }).unique(),
  shippingRules: jsonb('shipping_rules').$type<ShippingRule[]>().default([]).notNull(),
  taxRules: jsonb('tax_rules').$type<TaxRule[]>().default([]).notNull(),
  checkoutNotice: varchar('checkout_notice', { length: 500 }),
  bankTransferInstructions: varchar('bank_transfer_instructions', { length: 1000 }),
  codInstructions: varchar('cod_instructions', { length: 1000 }),
  socialLinks: jsonb('social_links').$type<Record<string, string>>().default({}).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const insertStoreSettingsSchema = createInsertSchema(storeSettings);
export const selectStoreSettingsSchema = createSelectSchema(storeSettings);
export type StoreSettings = z.infer<typeof selectStoreSettingsSchema>;
export type NewStoreSettings = z.infer<typeof insertStoreSettingsSchema>;
