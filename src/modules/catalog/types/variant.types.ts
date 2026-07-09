/**
 * Variant Generation — DTOs & Interfaces
 */

export interface VariantOption {
  name: string; // e.g., "Color"
  values: string[]; // e.g., ["Red", "Blue", "Green"]
}

export interface GenerateVariantsInput {
  productId: string;
  options: VariantOption[];
  basePriceInCents: number;
  baseStockQuantity: number;
}

export interface CreateVariantInput {
  productId: string;
  sku: string;
  title: string;
  options: Record<string, string>;
  priceInCents: number;
  compareAtPriceInCents?: number;
  costPerItemInCents?: number;
  stockQuantity: number;
  lowStockThreshold?: number;
  weight?: number;
  isDigital?: boolean;
}
