export const runtime = 'edge';

import { NextRequest } from 'next/server';
import { requireTenantAccess, AuthError } from '@/lib/auth/guards';
import { findProductById, updateProduct, deleteProduct } from '@/modules/catalog/repositories';
import { apiSuccess, apiError } from '@/lib/utils';

/**
 * Single Product API — Centralized Dashboard
 *
 * GET    /api/v1/products/[productId]?tenantId=xxx
 * PUT    /api/v1/products/[productId]  { tenantId, ...updates }
 * DELETE /api/v1/products/[productId]?tenantId=xxx
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const tenantId = request.nextUrl.searchParams.get('tenantId');
    if (!tenantId) return apiError('tenantId is required');

    await requireTenantAccess(tenantId);

    const product = await findProductById(tenantId, productId);
    if (!product) return apiError('Product not found', 404);

    return apiSuccess(product);
  } catch (err) {
    if (err instanceof AuthError) return apiError(err.message, err.statusCode);
    return apiError('Failed to fetch product', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const body = await request.json();
    if (!body.tenantId) return apiError('tenantId is required');

    await requireTenantAccess(body.tenantId);

    const updated = await updateProduct(body.tenantId, productId, body);
    if (!updated) return apiError('Product not found', 404);

    return apiSuccess(updated);
  } catch (err) {
    if (err instanceof AuthError) return apiError(err.message, err.statusCode);
    return apiError('Failed to update product', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const tenantId = request.nextUrl.searchParams.get('tenantId');
    if (!tenantId) return apiError('tenantId is required');

    await requireTenantAccess(tenantId);

    await deleteProduct(tenantId, productId);
    return apiSuccess({ deleted: true });
  } catch (err) {
    if (err instanceof AuthError) return apiError(err.message, err.statusCode);
    return apiError('Failed to delete product', 500);
  }
}
