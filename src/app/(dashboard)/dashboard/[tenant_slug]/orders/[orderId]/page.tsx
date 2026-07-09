import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { orders, orderItems, tenants } from '@/lib/db/schemas';
import { redirect } from 'next/navigation';
import { OrderDetailHeader } from '@/components/features/dashboard/orders/order-detail-header';
import { OrderItemsTable } from '@/components/features/dashboard/orders/order-items-table';
import { OrderStatusTransition } from '@/components/features/dashboard/orders/order-status-transition';

/**
 * Order Detail Page — Fetches real order + line items from DB.
 */
export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ tenant_slug: string; orderId: string }>;
}) {
  const { tenant_slug, orderId } = await params;

  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.slug, tenant_slug),
  });
  if (!tenant) redirect('/sign-in');

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
  });
  if (!order || order.tenantId !== tenant.id) {
    redirect(`/dashboard/${tenant_slug}/orders`);
  }

  const items = await db.query.orderItems.findMany({
    where: eq(orderItems.orderId, orderId),
  });

  return (
    <div className="space-y-8">
      <OrderDetailHeader order={order} />
      <OrderItemsTable items={items} currency={order.currency} />
      <OrderStatusTransition
        orderId={order.id}
        tenantId={tenant.id}
        currentStatus={order.status}
      />
    </div>
  );
}
