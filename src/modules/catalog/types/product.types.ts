import type { ProductStatus, ProductType } from '@/lib/db/schemas';

/**
 * Catalog Module — DTOs & Interfaces
 */

export interface CreateProductInput {
  tenantId: string;
  categoryId?: string;
  title: string;
  handle: string;
  description?: string;
  productType: ProductType;
  images?: string[];
  dynamicSpecs?: Record<string, string>;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
}

export interface UpdateProductInput {
  title?: string;
  handle?: string;
  description?: string;
  categoryId?: string;
  productType?: ProductType;
  status?: ProductStatus;
  images?: string[];
  dynamicSpecs?: Record<string, string>;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
}

export interface ProductWithVariants {
  id: string;
  tenantId: string;
  title: string;
  handle: string;
  description: string | null;
  productType: ProductType;
  status: ProductStatus;
  images: string[];
  dynamicSpecs: Record<string, string>;
  tags: string[];
  variants: VariantSummary[];
  category?: { id: string; name: string } | null;
}

export interface VariantSummary {
  id: string;
  sku: string;
  title: string;
  options: Record<string, string>;
  priceInCents: number;
  compareAtPriceInCents: number | null;
  stockQuantity: number;
  isActive: boolean;
}
