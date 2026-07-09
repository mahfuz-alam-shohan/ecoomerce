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

/**
 * VariantMatrixTable — Displays product variants with real data.
 * Shows SKU, options, price, and stock.
 */

interface Variant {
  id: string;
  sku: string;
  title: string;
  options: unknown;
  priceInCents: number;
  compareAtPriceInCents: number | null;
  stockQuantity: number;
  isActive: boolean | null;
}

export function VariantMatrixTable({ variants }: { variants: Variant[] }) {
  if (variants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/50 p-12 text-center">
        <p className="text-muted-foreground">No variants yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Variants will be generated when you define product options.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border/50">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SKU</TableHead>
            <TableHead>Variant</TableHead>
            <TableHead>Options</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Stock</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {variants.map((variant) => {
            const opts = variant.options as Record<string, string> | null;
            return (
              <TableRow key={variant.id}>
                <TableCell className="font-mono text-sm">
                  {variant.sku}
                </TableCell>
                <TableCell className="font-medium">{variant.title}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {opts &&
                      Object.entries(opts).map(([key, val]) => (
                        <Badge key={key} variant="secondary" className="text-xs">
                          {key}: {val}
                        </Badge>
                      ))}
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(variant.priceInCents)}
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={
                      variant.stockQuantity <= 5
                        ? 'text-destructive font-medium'
                        : 'text-muted-foreground'
                    }
                  >
                    {variant.stockQuantity}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={variant.isActive !== false ? 'default' : 'outline'}
                    className="text-xs"
                  >
                    {variant.isActive !== false ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
