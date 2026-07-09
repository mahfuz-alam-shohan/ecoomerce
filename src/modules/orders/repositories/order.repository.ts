import { eq, and, sql, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { orders, orderItems } from '@/lib/db/schemas';
import { withTenant } from '@/lib/db/tenant-context';
import type { OrderStatus } from '@/lib/db/schemas';

/**
 * Order Repository — Pure database queries for orders.
 * All queries are strictly tenant-scoped via withTenant().
 */

export async function findOrdersByTenant(
  tenantId: string,
  options?: { status?: OrderStatus; limit?: number; offset?: number }
) {
  const conditions = [withTenant(tenantId, orders.tenantId)];

  if (options?.status) {
    conditions.push(eq(orders.status, options.status));
  }

  return db
    .select()
    .from(orders)
    .where(and(...conditions))
    .limit(options?.limit ?? 50)
    .offset(options?.offset ?? 0)
    .orderBy(desc(orders.createdAt));
}

export async function findOrderById(tenantId: string, orderId: string) {
  return db.query.orders.findFirst({
    where: and(withTenant(tenantId, orders.tenantId), eq(orders.id, orderId)),
  });
}

export async function findOrderByNumber(tenantId: string, orderNumber: string) {
  return db.query.orders.findFirst({
    where: and(withTenant(tenantId, orders.tenantId), eq(orders.orderNumber, orderNumber)),
  });
}

export async function updateOrderStatus(tenantId: string, orderId: string, newStatus: OrderStatus) {
  const [updated] = await db
    .update(orders)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(and(withTenant(tenantId, orders.tenantId), eq(orders.id, orderId)))
    .returning();

  return updated;
}

export async function findOrderItemsByOrder(orderId: string) {
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function countOrdersByTenant(tenantId: string) {
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(withTenant(tenantId, orders.tenantId));

  return Number(result.count);
}

export async function getTenantRevenue(tenantId: string) {
  const [result] = await db
    .select({ total: sql<number>`coalesce(sum(total_amount_in_cents), 0)` })
    .from(orders)
    .where(
      and(
        withTenant(tenantId, orders.tenantId),
        eq(orders.status, 'delivered')
      )
    );

  return Number(result.total);
}
