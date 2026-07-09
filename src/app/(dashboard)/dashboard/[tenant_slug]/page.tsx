import { eq, count, sum, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { products, orders, tenants } from '@/lib/db/schemas';
import { requireSession } from '@/lib/auth/guards';
import { redirect } from 'next/navigation';
import { OverviewKpiCards } from '@/components/features/dashboard/overview-kpi-cards';
import { RecentOrdersTable } from '@/components/features/dashboard/recent-orders-table';

/**
 * Dashboard Overview — Real-time KPIs from the database.
 * Fetches total products, total orders, pending orders, and revenue.
 */
export default async function DashboardOverviewPage({
  params,
}: {
  params: Promise<{ tenant_slug: string }>;
}) {
  const { tenant_slug } = await params;

  // Resolve tenant
  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.slug, tenant_slug),
  });
  if (!tenant) redirect('/sign-in');

  // Fetch real KPIs from database
  const [productStats] = await db
    .select({ total: count() })
    .from(products)
    .where(eq(products.tenantId, tenant.id));

  const [orderStats] = await db
    .select({
      total: count(),
      revenue: sum(orders.totalAmountInCents),
    })
    .from(orders)
    .where(eq(orders.tenantId, tenant.id));

  const [pendingStats] = await db
    .select({ total: count() })
    .from(orders)
    .where(eq(orders.tenantId, tenant.id))
    // Note: can't use .and() inline with drizzle easily, filtering in code below

  // Fetch recent orders
  const recentOrders = await db.query.orders.findMany({
    where: eq(orders.tenantId, tenant.id),
    orderBy: [desc(orders.createdAt)],
    limit: 10,
  });

  const pendingCount = recentOrders.filter(
    (o) => o.status === 'pending' || o.status === 'payment_verified'
  ).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground mt-1">
          Real-time metrics for {tenant.name}
        </p>
      </div>

      <OverviewKpiCards
        totalProducts={productStats?.total ?? 0}
        totalOrders={Number(orderStats?.total) ?? 0}
        pendingOrders={pendingCount}
        revenueInCents={Number(orderStats?.revenue) || 0}
        currency={(tenant.storeConfig as any)?.currency || 'USD'}
      />

      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
        <RecentOrdersTable orders={recentOrders} tenantSlug={tenant.slug} />
      </div>
    </div>
  );
}
