/**
 * Headless Storefront Data Types
 * These interfaces match the JSON payload served by the central ECom Engine (/api/v1/storefront/*).
 */

export interface ThemeConfig {
  templateId: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  headerStyle: 'glass' | 'solid' | 'minimal';
  cardStyle: 'zoom-hover' | 'quick-add' | 'bordered';
  borderRadius: '0px' | '6px' | '12px';
  defaultMode?: 'light' | 'dark' | 'system';
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

export interface Variant {
  id: string;
  sku: string;
  title: string;
  options: Record<string, string>;
  priceInCents: number;
  compareAtPriceInCents?: number | null;
  stockQuantity: number;
  isDigital?: boolean;
}

export interface Product {
  id: string;
  tenantId: string;
  categoryId?: string | null;
  title: string;
  handle: string;
  description?: string | null;
  images: string[];
  tags: string[];
  variants: Variant[];
  minPriceInCents: number;
  maxPriceInCents: number;
  totalStock: number;
  createdAt: string;
}

export interface StorefrontResolvedData {
  tenantId: string;
  name: string;
  slug: string;
  customDomain?: string | null;
  storefrontApiKey?: string | null;
  themeConfig: ThemeConfig;
  storeConfig: StoreConfig;
  storefrontConfig: StorefrontContentConfig;
}

export interface Category {
  id: string;
  tenantId?: string;
  name: string;
  slug: string;
  description?: string | null;
}
