
import { NextRequest } from 'next/server';
import { findProductsByTenant, findProductByHandle } from '@/modules/catalog/repositories';
import { findVariantsByProduct } from '@/modules/catalog/repositories';
import { apiSuccess, apiError } from '@/lib/utils';

/**
 * Storefront Products API — Public
 *
 * GET /api/v1/storefront/products?tenantId=xxx&search=phone&limit=20
 * GET /api/v1/storefront/products?tenantId=xxx&handle=iphone-15-pro
 *
 * Returns only ACTIVE products for public storefront display.
 * When handle is provided, returns product + its variants for PDP.
 * This endpoint is public (no auth required).
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const tenantId = searchParams.get('tenantId');
    const handle = searchParams.get('handle');

    if (!tenantId) return apiError('tenantId query parameter is required');

    // Single product by handle (Product Detail Page)
    if (handle) {
      const product = await findProductByHandle(tenantId, handle);
      if (!product) return apiError('Product not found', 404);

      const variants = await findVariantsByProduct(product.id);

      return apiSuccess({ product, variants });
    }

    // Product listing (Catalog Grid)
    const products = await findProductsByTenant(tenantId, {
      status: 'active', // Only show active products on storefront
      search: searchParams.get('search') || undefined,
      limit: Number(searchParams.get('limit')) || 24,
      offset: Number(searchParams.get('offset')) || 0,
    });

    return apiSuccess(products);
  } catch (err) {
    return apiError('Failed to fetch products', 500);
  }
}
