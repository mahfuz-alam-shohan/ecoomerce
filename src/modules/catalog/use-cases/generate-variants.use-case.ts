import { db } from '@/lib/db';
import { variantMatrixValidator } from '../validators';
import { insertVariantsBatch, deleteVariantsByProduct } from '../repositories';
import type { GenerateVariantsInput, CreateVariantInput } from '../types';

/**
 * Generate Variants Use-Case
 *
 * Takes a list of option groups (e.g., [{name: "Color", values: ["Red", "Blue"]}, {name: "Size", values: ["S", "M"]}])
 * and generates the full cartesian product of SKU variants:
 *   - Red / S, Red / M, Blue / S, Blue / M
 *
 * Each variant gets a unique auto-generated SKU, the base price, and base stock quantity.
 * All changes run atomically in a database transaction to prevent leaving products with zero variants on error.
 */
export async function generateVariants(input: GenerateVariantsInput) {
  // Step 1: Validate
  const validated = variantMatrixValidator.parse(input);

  // Step 2: Generate cartesian product of all option combinations
  const combinations = cartesianProduct(validated.options.map((opt) => opt.values));

  const variantInputs: CreateVariantInput[] = combinations.map((combo, index) => {
    const options: Record<string, string> = {};
    validated.options.forEach((opt, i) => {
      options[opt.name] = combo[i];
    });

    const title = combo.join(' / ');
    const sku = `${validated.productId.slice(0, 8)}-${index + 1}`.toUpperCase();

    return {
      productId: validated.productId,
      sku,
      title,
      options,
      priceInCents: validated.basePriceInCents,
      stockQuantity: validated.baseStockQuantity,
    };
  });

  // Step 3: Clear existing variants and insert new batch atomically
  return await db.transaction(async () => {
    await deleteVariantsByProduct(validated.productId);
    return await insertVariantsBatch(variantInputs);
  });
}

/**
 * Computes the cartesian product of multiple arrays.
 * cartesianProduct([["Red","Blue"], ["S","M"]]) => [["Red","S"],["Red","M"],["Blue","S"],["Blue","M"]]
 */
function cartesianProduct(arrays: string[][]): string[][] {
  return arrays.reduce<string[][]>(
    (acc, curr) => acc.flatMap((combo) => curr.map((val) => [...combo, val])),
    [[]]
  );
}
