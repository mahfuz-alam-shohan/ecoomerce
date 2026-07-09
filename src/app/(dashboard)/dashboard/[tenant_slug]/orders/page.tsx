import { eq, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { orders, tenants } from '@/lib/db/schemas';
import { redirect } from 'next/navigation';
import { RecentOrdersTable } from '@/components/features/dashboard/recent-orders-table';

/**
 * Orders List Page — Fetches all orders for this tenant.
 */
export default async function OrdersPage({
  params,
}: {
  params: Promise<{ tenant_slug: string }>;
}) {
  const { tenant_slug } = await params;

  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.slug, tenant_slug),
  });
  if (!tenant) redirect('/sign-in');

  const orderList = await db.query.orders.findMany({
    where: eq(orders.tenantId, tenant.id),
    orderBy: [desc(orders.createdAt)],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground mt-1">
          Manage and fulfill customer orders ({orderList.length} total)
        </p>
      </div>

      <RecentOrdersTable orders={orderList} tenantSlug={tenant_slug} />
    </div>
  );
}
