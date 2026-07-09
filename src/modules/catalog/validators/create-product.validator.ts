import { z } from 'zod';
import { productTypes } from '@/lib/db/schemas';

/**
 * Zod validator for product creation input.
 * Enforces title length, handle format (URL-safe slug),
 * and valid product types.
 */
export const createProductValidator = z.object({
  tenantId: z.string().uuid(),
  categoryId: z.string().uuid().optional(),
  title: z.string().min(1, 'Product title is required').max(500),
  handle: z
    .string()
    .min(1)
    .max(500)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Handle must be a URL-safe slug (e.g., "blue-running-shoes")'),
  description: z.string().max(10000).optional(),
  productType: z.enum(productTypes).default('physical'),
  images: z.array(z.string().url()).max(20).optional(),
  dynamicSpecs: z.record(z.string(), z.string()).optional(),
  tags: z.array(z.string().max(100)).max(50).optional(),
  seoTitle: z.string().max(255).optional(),
  seoDescription: z.string().max(500).optional(),
});

export type ValidatedCreateProductInput = z.infer<typeof createProductValidator>;
