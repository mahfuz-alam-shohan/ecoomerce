import { pgTable, uuid, varchar, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export interface ThemeConfig {
  templateId: string; // Dynamic — references `storefront_templates.id` registry. Unlimited templates.
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  fontFamily: string;
  logoUrl?: string;
  customCss?: string; // Optional tenant CSS overrides
}

export interface StoreConfig {
  currency: string;
  taxRatePercent: number;
  freeShippingThresholdCents: number;
  features: {
    enableCod: boolean;
    enableBankTransfer: boolean;
    enableSandboxPay: boolean;
  };
}

export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  customDomain: varchar('custom_domain', { length: 255 }).unique(),
  name: varchar('name', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).default('active').notNull(),
  themeConfig: jsonb('theme_config').$type<ThemeConfig>().default({
    templateId: 'default-modern',
    primaryColor: '#3b82f6',
    secondaryColor: '#1e40af',
    fontFamily: 'Inter',
  }).notNull(),
  storeConfig: jsonb('store_config').$type<StoreConfig>().default({
    currency: 'USD',
    taxRatePercent: 5,
    freeShippingThresholdCents: 10000,
    features: {
      enableCod: true,
      enableBankTransfer: true,
      enableSandboxPay: true,
    },
  }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const insertTenantSchema = createInsertSchema(tenants);
export const selectTenantSchema = createSelectSchema(tenants);
export type Tenant = z.infer<typeof selectTenantSchema>;
export type NewTenant = z.infer<typeof insertTenantSchema>;
