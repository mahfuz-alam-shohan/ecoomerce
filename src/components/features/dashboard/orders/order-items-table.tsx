import { formatCurrency } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

/**
 * OrderItemsTable — Displays purchased line items with real snapshot data.
 */

interface OrderItem {
  id: string;
  title: string;
  sku: string | null;
  quantity: number;
  unitPriceInCents: number;
  totalPriceInCents: number;
}

export function OrderItemsTable({
  items,
  currency,
}: {
  items: OrderItem[];
  currency: string;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        Items ({items.length})
      </h2>
      <div className="rounded-lg border border-border/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {item.sku || '—'}
                </TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(item.unitPriceInCents, currency)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(item.totalPriceInCents, currency)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
