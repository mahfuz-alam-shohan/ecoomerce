import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { OrderStatusBadge } from '@/components/features/dashboard/orders/order-status-badge';

/**
 * RecentOrdersTable — Shows last 10 orders with real data.
 */

interface Order {
  id: string;
  orderNumber: string;
  customerName: string | null;
  customerEmail: string;
  totalAmountInCents: number;
  currency: string;
  status: string;
  createdAt: Date | null;
}

export function RecentOrdersTable({
  orders,
  tenantSlug,
}: {
  orders: Order[];
  tenantSlug: string;
}) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/50 p-12 text-center">
        <p className="text-muted-foreground">No orders yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Orders will appear here once customers start purchasing.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border/50">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>
                <Link
                  href={`/dashboard/${tenantSlug}/orders/${order.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {order.orderNumber}
                </Link>
              </TableCell>
              <TableCell>
                <div>
                  <p className="text-sm font-medium">
                    {order.customerName || 'Guest'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {order.customerEmail}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <OrderStatusBadge status={order.status} />
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(order.totalAmountInCents, order.currency)}
              </TableCell>
              <TableCell className="text-right text-sm text-muted-foreground">
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString()
                  : '—'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
