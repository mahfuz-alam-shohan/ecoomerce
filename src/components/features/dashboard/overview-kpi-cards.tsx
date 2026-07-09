import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, Clock, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

/**
 * OverviewKpiCards — 4 stat cards showing real tenant metrics.
 */

interface KpiCardsProps {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  revenueInCents: number;
  currency: string;
}

export function OverviewKpiCards({
  totalProducts,
  totalOrders,
  pendingOrders,
  revenueInCents,
  currency,
}: KpiCardsProps) {
  const cards = [
    {
      title: 'Total Products',
      value: totalProducts.toString(),
      icon: Package,
      description: 'Active catalog items',
    },
    {
      title: 'Total Orders',
      value: totalOrders.toString(),
      icon: ShoppingCart,
      description: 'All-time orders received',
    },
    {
      title: 'Pending Orders',
      value: pendingOrders.toString(),
      icon: Clock,
      description: 'Awaiting processing',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(revenueInCents, currency),
      icon: DollarSign,
      description: 'All-time revenue',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
