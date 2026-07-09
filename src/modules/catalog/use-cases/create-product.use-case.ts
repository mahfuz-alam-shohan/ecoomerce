import { createProductValidator } from '../validators';
import { insertProduct } from '../repositories';
import type { CreateProductInput } from '../types';

/**
 * Create Product Use-Case
 *
 * Validates input via Zod, creates the product record in the database,
 * and returns the new product. Handles slug uniqueness errors.
 */
export async function createProduct(input: CreateProductInput) {
  // Step 1: Validate input
  const validated = createProductValidator.parse(input);

  // Step 2: Insert into database
  const product = await insertProduct(validated);

  if (!product) {
    throw new Error('Failed to create product. Handle may already exist for this store.');
  }

  return product;
}
