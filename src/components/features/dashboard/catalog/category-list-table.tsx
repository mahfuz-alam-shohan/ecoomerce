import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

/**
 * CategoryListTable — Displays categories with real data.
 */

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  createdAt: Date | null;
}

export function CategoryListTable({ categories }: { categories: Category[] }) {
  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/50 p-16 text-center">
        <p className="text-lg font-medium">No categories yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Create your first category to organize products.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border/50">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Sort Order</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((cat) => (
            <TableRow key={cat.id}>
              <TableCell className="font-medium">{cat.name}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                /{cat.slug}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                {cat.description || '—'}
              </TableCell>
              <TableCell className="text-right">{cat.sortOrder ?? 0}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
