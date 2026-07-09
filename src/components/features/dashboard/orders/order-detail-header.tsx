import { formatCurrency } from '@/lib/utils';
import { OrderStatusBadge } from './order-status-badge';
import { Card, CardContent } from '@/components/ui/card';

/**
 * OrderDetailHeader — Displays order summary info.
 */

interface Order {
  id: string;
  orderNumber: string;
  customerName: string | null;
  customerEmail: string;
  totalAmountInCents: number;
  subtotalInCents: number;
  taxInCents: number;
  shippingInCents: number;
  discountInCents: number;
  currency: string;
  status: string;
  paymentMethod: string;
  shippingAddress: unknown;
  createdAt: Date | null;
}

export function OrderDetailHeader({ order }: { order: Order }) {
  const address = order.shippingAddress as Record<string, string> | null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Order {order.orderNumber}
          </h1>
          <p className="text-muted-foreground mt-1">
            Placed on{' '}
            {order.createdAt
              ? new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : '—'}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Customer
            </h3>
            <p className="font-medium">{order.customerName || 'Guest'}</p>
            <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Payment
            </h3>
            <p className="font-medium capitalize">
              {order.paymentMethod.replace(/_/g, ' ')}
            </p>
            <p className="text-2xl font-bold mt-1">
              {formatCurrency(order.totalAmountInCents, order.currency)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Shipping Address
            </h3>
            {address ? (
              <div className="text-sm">
                <p>{address.street}</p>
                <p>
                  {address.city}, {address.state} {address.zip}
                </p>
                <p>{address.country}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No address provided</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
