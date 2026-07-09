import { pgTable, uuid, varchar, timestamp, boolean, text, jsonb } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

/**
 * Storefront Templates Registry
 *
 * Fully dynamic — add unlimited templates just by inserting a row here.
 * Each template has a unique `slug` (e.g., "luxe-boutique", "tech-modern", "minimal-editorial").
 * The tenant's `themeConfig.templateId` references this table's `slug`.
 *
 * To deploy a new template:
 *   1. Create the component folder: `src/components/templates/[slug]/`
 *   2. Insert a row into this table with the slug.
 *   3. Done — any tenant can now select it.
 */

export interface TemplateMetadata {
  category: string;        // e.g., "fashion", "electronics", "food", "general"
  supportedLayouts: string[]; // e.g., ["hero-banner", "hero-split", "hero-carousel"]
  previewImages: string[];
  features: string[];      // e.g., ["dark-mode", "rtl-support", "animated-hero"]
}

export const storefrontTemplates = pgTable('storefront_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 100 }).notNull().unique(), // "luxe-boutique", "tech-modern"
  name: varchar('name', { length: 255 }).notNull(),          // "Luxe Boutique Theme"
  description: text('description'),
  thumbnailUrl: varchar('thumbnail_url', { length: 512 }),
  metadata: jsonb('metadata').$type<TemplateMetadata>().default({
    category: 'general',
    supportedLayouts: ['hero-banner'],
    previewImages: [],
    features: [],
  }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  isPremium: boolean('is_premium').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const insertStorefrontTemplateSchema = createInsertSchema(storefrontTemplates);
export const selectStorefrontTemplateSchema = createSelectSchema(storefrontTemplates);
export type StorefrontTemplate = z.infer<typeof selectStorefrontTemplateSchema>;
export type NewStorefrontTemplate = z.infer<typeof insertStorefrontTemplateSchema>;
