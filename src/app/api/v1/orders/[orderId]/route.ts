
import { NextRequest } from 'next/server';
import { requireTenantAccess, AuthError } from '@/lib/auth/guards';
import { findOrderById, findOrderItemsByOrder } from '@/modules/orders/repositories';
import { transitionOrderStatus } from '@/modules/orders/use-cases';
import { apiSuccess, apiError } from '@/lib/utils';

/**
 * Single Order API — Centralized Dashboard
 *
 * GET  /api/v1/orders/[orderId]?tenantId=xxx
 * PUT  /api/v1/orders/[orderId]  { tenantId, newStatus }  (state machine transition)
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const tenantId = request.nextUrl.searchParams.get('tenantId');
    if (!tenantId) return apiError('tenantId is required');

    await requireTenantAccess(tenantId);

    const order = await findOrderById(tenantId, orderId);
    if (!order) return apiError('Order not found', 404);

    const items = await findOrderItemsByOrder(orderId);

    return apiSuccess({ order, items });
  } catch (err) {
    if (err instanceof AuthError) return apiError(err.message, err.statusCode);
    return apiError('Failed to fetch order', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const body = await request.json();

    if (!body.tenantId) return apiError('tenantId is required');
    if (!body.newStatus) return apiError('newStatus is required');

    await requireTenantAccess(body.tenantId);

    const updated = await transitionOrderStatus({
      tenantId: body.tenantId,
      orderId,
      newStatus: body.newStatus,
      notes: body.notes,
    });

    return apiSuccess(updated);
  } catch (err) {
    if (err instanceof AuthError) return apiError(err.message, err.statusCode);
    if ((err as Error).message.includes('Invalid status transition')) {
      return apiError((err as Error).message, 422);
    }
    return apiError('Failed to update order status', 500);
  }
}
