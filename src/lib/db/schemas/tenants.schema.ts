import { pgTable, uuid, varchar, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export interface ThemeConfig {
  templateId: string; // Dynamic — references `storefront_templates.slug` registry ('default-modern', 'default-fashion')
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  fontFamily: string;
  headerStyle?: 'glass' | 'solid' | 'minimal';
  cardStyle?: 'zoom-hover' | 'quick-add' | 'bordered';
  borderRadius?: '0px' | '6px' | '12px';
  defaultMode?: 'light' | 'dark' | 'system';
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

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonUrl: string;
  imageUrl: string;
  badgeText?: string;
  isActive: boolean;
}

export interface PromoAdBanner {
  id: string;
  title: string;
  description: string;
  discountCode?: string;
  imageUrl?: string;
  targetUrl: string;
  position: 'home_top' | 'home_middle' | 'catalog_top';
  isActive: boolean;
}

export interface TrustBadge {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface StorefrontContentConfig {
  announcementBar: {
    enabled: boolean;
    text: string;
    linkUrl?: string;
    backgroundColor: string;
    textColor: string;
  };
  heroSlides: HeroSlide[];
  promoAds: PromoAdBanner[];
  navigation: { label: string; href: string }[];
  footer: {
    aboutText: string;
    email: string;
    phone: string;
    address: string;
    socialLinks: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
      whatsapp?: string;
    };
    copyrightText: string;
  };
  trustBadges: TrustBadge[];
}

export const tenants = pgTable(
  'tenants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
    customDomain: varchar('custom_domain', { length: 255 }).unique(),
    name: varchar('name', { length: 255 }).notNull(),
    status: varchar('status', { length: 50 }).default('active').notNull(),
    storefrontApiKey: varchar('storefront_api_key', { length: 255 }).unique(),
    storefrontSecretKey: varchar('storefront_secret_key', { length: 255 }),
    themeConfig: jsonb('theme_config').$type<ThemeConfig>().default({
      templateId: 'default-modern',
      primaryColor: '#3b82f6',
      secondaryColor: '#1e40af',
      accentColor: '#f59e0b',
      fontFamily: 'Inter',
      headerStyle: 'glass',
      cardStyle: 'zoom-hover',
      borderRadius: '6px',
      defaultMode: 'system',
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
    storefrontConfig: jsonb('storefront_config').$type<StorefrontContentConfig>().default({
      announcementBar: {
        enabled: true,
        text: '🎉 Free Express Shipping on Orders Over $100 | Easy 30-Day Returns',
        linkUrl: '/catalog',
        backgroundColor: '#1e293b',
        textColor: '#ffffff',
      },
      heroSlides: [
        {
          id: 'slide-1',
          title: 'Next-Generation Collection',
          subtitle: 'Engineered for precision, speed, and premium daily utility.',
          buttonText: 'Explore Catalog',
          buttonUrl: '/catalog',
          imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop',
          badgeText: '⚡ NEW ARRIVALS',
          isActive: true,
        },
      ],
      promoAds: [
        {
          id: 'promo-1',
          title: 'Special Member Discount',
          description: 'Use code WELCOME10 for 10% off your first checkout today.',
          discountCode: 'WELCOME10',
          targetUrl: '/catalog',
          position: 'home_top',
          isActive: true,
        },
      ],
      navigation: [
        { label: 'Home', href: '/' },
        { label: 'Shop Catalog', href: '/catalog' },
        { label: 'Categories', href: '/categories' },
        { label: 'Deals & Sale', href: '/catalog?sale=true' },
      ],
      footer: {
        aboutText: 'Leading modern retail platform dedicated to quality products and fast, dependable global shipping.',
        email: 'support@store.com',
        phone: '+1 (800) 555-0199',
        address: '100 E-Commerce Ave, Suite 400, Retail City, CA 90210',
        socialLinks: {
          facebook: 'https://facebook.com',
          instagram: 'https://instagram.com',
          twitter: 'https://twitter.com',
        },
        copyrightText: '© 2026 Store. All rights reserved.',
      },
      trustBadges: [
        { id: 'tb-1', icon: 'shield', title: '256-Bit SSL Secure', description: 'Enterprise-grade payment protection' },
        { id: 'tb-2', icon: 'truck', title: 'Fast Global Delivery', description: 'Reliable express shipping with live tracking' },
        { id: 'tb-3', icon: 'refresh', title: '30-Day Returns', description: 'Hassle-free return & replacement guarantee' },
        { id: 'tb-4', icon: 'support', title: '24/7 Priority Help', description: 'Always here to assist with your orders' },
      ],
    }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_tenants_status').on(table.status),
  ]
);

export const insertTenantSchema = createInsertSchema(tenants);
export const selectTenantSchema = createSelectSchema(tenants);
export type Tenant = z.infer<typeof selectTenantSchema>;
export type NewTenant = z.infer<typeof insertTenantSchema>;
