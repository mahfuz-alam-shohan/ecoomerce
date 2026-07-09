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
import { ExternalLink, Store } from 'lucide-react';
import { CreateTenantModal } from '@/components/features/platform/create-tenant-modal';

/**
 * Tenants Management Page — Lists all tenants + Add Store button.
 * Super Admin only (enforced by platform layout).
 */
export default async function TenantsPage() {
  const tenantList = await db.query.tenants.findMany({
    orderBy: [desc(tenants.createdAt)],
  });

  return (
    <div className="space-y-6">
      {/* Header with Add Store button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tenants</h1>
          <p className="text-muted-foreground mt-1">
            Manage all stores on the platform ({tenantList.length} total)
          </p>
        </div>
        <CreateTenantModal />
      </div>

      {/* Tenants Table */}
      {tenantList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/60 py-16">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Store className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No stores yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Get started by creating your first tenant store.
          </p>
          <div className="mt-6">
            <CreateTenantModal />
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-border/50">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Store Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenantList.map((tenant) => {
                const theme = tenant.themeConfig as any;
                const store = tenant.storeConfig as any;
                return (
                  <TableRow key={tenant.id}>
                    <TableCell className="font-medium">{tenant.name}</TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                        {tenant.slug}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          tenant.status === 'active'
                            ? 'default'
                            : tenant.status === 'suspended'
                            ? 'destructive'
                            : 'secondary'
                        }
                        className="text-xs capitalize"
                      >
                        {tenant.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {store?.currency || 'USD'}
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
      )}
    </div>
  );
}
