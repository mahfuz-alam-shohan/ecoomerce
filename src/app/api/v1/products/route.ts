import { NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { requireRole, requireTenantAccess, AuthError } from '@/lib/auth/guards';
import { findProductsByTenant, countProductsByTenant, insertProduct } from '@/modules/catalog/repositories';
import { createProductValidator } from '@/modules/catalog/validators';
import { apiSuccess, apiCreated, apiError } from '@/lib/utils';

/**
 * Products API — Centralized Dashboard
 *
 * GET  /api/v1/products?tenantId=xxx&status=active&search=phone&limit=20&offset=0
 * POST /api/v1/products  { tenantId, title, handle, ... }
 *
 * All operations require authenticated tenant_owner or super_admin role.
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) return apiError('tenantId query parameter is required');

    await requireTenantAccess(tenantId);

    const statusParam = searchParams.get('status');
    const status = statusParam === 'active' || statusParam === 'draft' || statusParam === 'archived' ? statusParam : undefined;

    const products = await findProductsByTenant(tenantId, {
      status,
      search: searchParams.get('search') || undefined,
      limit: Number(searchParams.get('limit')) || 50,
      offset: Number(searchParams.get('offset')) || 0,
    });

    const total = await countProductsByTenant(tenantId);

    return apiSuccess(products, { total, limit: 50, offset: 0 });
  } catch (err) {
    if (err instanceof AuthError) return apiError(err.message, err.statusCode);
    return apiError('Failed to fetch products', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.tenantId) return apiError('tenantId is required');

    await requireTenantAccess(body.tenantId);

    const validated = createProductValidator.parse(body);
    const product = await insertProduct(validated);

    return apiCreated(product);
  } catch (err) {
    if (err instanceof AuthError) return apiError(err.message, err.statusCode);
    if (err instanceof ZodError) {
      return apiError(`Validation failed: ${err.issues?.[0]?.message}`, 422);
    }
    return apiError('Failed to create product', 500);
  }
}
