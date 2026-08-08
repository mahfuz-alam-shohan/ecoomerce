import { count, sum } from 'drizzle-orm';
import { db } from '@/lib/db';
import { tenants, orders, users } from '@/lib/db/schemas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, ShoppingCart, DollarSign, Users } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

/**
 * Platform Overview — Real system-wide metrics.
 */
export const dynamic = 'force-dynamic';

export default async function PlatformOverviewPage() {
  const [tenantCount] = await db.select({ total: count() }).from(tenants);
  const [orderStats] = await db
    .select({ total: count(), revenue: sum(orders.totalAmountInCents) })
    .from(orders);
  const [userCount] = await db.select({ total: count() }).from(users);

  const stats = [
    {
      title: 'Total Tenants',
      value: tenantCount?.total?.toString() || '0',
      icon: Building2,
      description: 'Active stores on the platform',
    },
    {
      title: 'Total Orders',
      value: orderStats?.total?.toString() || '0',
      icon: ShoppingCart,
      description: 'Across all tenants',
    },
    {
      title: 'Platform Revenue',
      value: formatCurrency(Number(orderStats?.revenue) || 0),
      icon: DollarSign,
      description: 'Combined revenue',
    },
    {
      title: 'Total Users',
      value: userCount?.total?.toString() || '0',
      icon: Users,
      description: 'Owners, staff, and customers',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Overview</h1>
        <p className="text-muted-foreground mt-1">
          System-wide metrics and management
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
