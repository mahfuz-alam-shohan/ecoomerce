export const runtime = 'edge';

import { NextRequest } from 'next/server';
import { requireTenantAccess, AuthError } from '@/lib/auth/guards';
import { findOrdersByTenant, countOrdersByTenant, getTenantRevenue } from '@/modules/orders/repositories';
import { apiSuccess, apiError } from '@/lib/utils';
import type { OrderStatus } from '@/lib/db/schemas';

/**
 * Orders API — Centralized Dashboard
 *
 * GET /api/v1/orders?tenantId=xxx&status=pending&limit=20&offset=0
 *
 * Returns paginated orders for a tenant with total count and revenue summary.
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) return apiError('tenantId query parameter is required');

    await requireTenantAccess(tenantId);

    const ordersList = await findOrdersByTenant(tenantId, {
      status: (searchParams.get('status') as OrderStatus) || undefined,
      limit: Number(searchParams.get('limit')) || 50,
      offset: Number(searchParams.get('offset')) || 0,
    });

    const total = await countOrdersByTenant(tenantId);
    const revenue = await getTenantRevenue(tenantId);

    return apiSuccess(ordersList, { total, revenueInCents: revenue });
  } catch (err) {
    if (err instanceof AuthError) return apiError(err.message, err.statusCode);
    return apiError('Failed to fetch orders', 500);
  }
}
