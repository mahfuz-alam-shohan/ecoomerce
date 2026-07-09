import { desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { tenants } from '@/lib/db/schemas';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

/**
 * Tenants Management Page — Lists all tenants from DB.
 */
export default async function TenantsPage() {
  const tenantList = await db.query.tenants.findMany({
    orderBy: [desc(tenants.createdAt)],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tenants</h1>
        <p className="text-muted-foreground mt-1">
          Manage all stores on the platform ({tenantList.length} total)
        </p>
      </div>

      <div className="rounded-lg border border-border/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Store Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Template</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenantList.map((tenant) => {
              const theme = tenant.themeConfig as any;
              return (
                <TableRow key={tenant.id}>
                  <TableCell className="font-medium">{tenant.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {tenant.slug}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={tenant.status === 'active' ? 'default' : 'secondary'}
                      className="text-xs capitalize"
                    >
                      {tenant.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {theme?.templateId || '—'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {tenant.createdAt
                      ? new Date(tenant.createdAt).toLocaleDateString()
                      : '—'}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/${tenant.slug}`}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
