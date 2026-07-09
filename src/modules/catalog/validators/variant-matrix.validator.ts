import { z } from 'zod';

/**
 * Zod validator for variant matrix generation input.
 * Ensures valid option names, non-empty value arrays,
 * and positive pricing/stock values.
 */
export const variantMatrixValidator = z.object({
  productId: z.string().uuid(),
  options: z
    .array(
      z.object({
        name: z.string().min(1, 'Option name is required').max(100),
        values: z.array(z.string().min(1).max(100)).min(1, 'At least one value required').max(50),
      })
    )
    .min(1, 'At least one option group is required')
    .max(5, 'Maximum 5 option groups'),
  basePriceInCents: z.number().int().min(0, 'Price must be non-negative'),
  baseStockQuantity: z.number().int().min(0, 'Stock must be non-negative'),
});

export type ValidatedVariantMatrixInput = z.infer<typeof variantMatrixValidator>;
