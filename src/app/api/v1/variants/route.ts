
import { NextRequest } from 'next/server';
import { requireTenantAccess, AuthError } from '@/lib/auth/guards';
import { generateVariants } from '@/modules/catalog/use-cases';
import { findVariantsByProduct } from '@/modules/catalog/repositories';
import { apiSuccess, apiCreated, apiError } from '@/lib/utils';

/**
 * Variants API — Centralized Dashboard
 *
 * GET  /api/v1/variants?productId=xxx
 * POST /api/v1/variants  { tenantId, productId, options: [...], basePriceInCents, baseStockQuantity }
 *
 * POST triggers the cartesian-product variant matrix generator.
 */

export async function GET(request: NextRequest) {
  try {
    const productId = request.nextUrl.searchParams.get('productId');
    if (!productId) return apiError('productId query parameter is required');

    const variants = await findVariantsByProduct(productId);
    return apiSuccess(variants);
  } catch (err) {
    return apiError('Failed to fetch variants', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.tenantId) return apiError('tenantId is required');
    await requireTenantAccess(body.tenantId);

    const created = await generateVariants({
      productId: body.productId,
      options: body.options,
      basePriceInCents: body.basePriceInCents,
      baseStockQuantity: body.baseStockQuantity,
    });

    return apiCreated(created);
  } catch (err) {
    if (err instanceof AuthError) return apiError(err.message, err.statusCode);
    if ((err as any)?.name === 'ZodError') {
      return apiError(`Validation failed: ${(err as any).errors?.[0]?.message}`, 422);
    }
    return apiError('Failed to generate variants', 500);
  }
}
