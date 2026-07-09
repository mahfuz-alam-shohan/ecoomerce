import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pencil } from 'lucide-react';

/**
 * ProductListTable — Displays all products with real data.
 */

interface Product {
  id: string;
  title: string;
  handle: string;
  status: string;
  productType: string;
  images: unknown;
  createdAt: Date | null;
}

export function ProductListTable({
  products,
  tenantSlug,
}: {
  products: Product[];
  tenantSlug: string;
}) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/50 p-16 text-center">
        <p className="text-lg font-medium">No products yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Create your first product to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border/50">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Handle</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Created</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <Link
                  href={`/dashboard/${tenantSlug}/catalog/${product.id}`}
                  className="font-medium hover:text-primary transition-colors"
                >
                  {product.title}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                /{product.handle}
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="text-xs capitalize">
                  {product.productType}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={product.status === 'active' ? 'default' : 'outline'}
                  className="text-xs capitalize"
                >
                  {product.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right text-sm text-muted-foreground">
                {product.createdAt
                  ? new Date(product.createdAt).toLocaleDateString()
                  : '—'}
              </TableCell>
              <TableCell>
                <Link
                  href={`/dashboard/${tenantSlug}/catalog/${product.id}`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
