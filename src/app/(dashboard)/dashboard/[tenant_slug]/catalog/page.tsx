import { eq, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { products, tenants } from '@/lib/db/schemas';
import { redirect } from 'next/navigation';
import { ProductListToolbar } from '@/components/features/dashboard/catalog/product-list-toolbar';
import { ProductListTable } from '@/components/features/dashboard/catalog/product-list-table';

/**
 * Product Catalog Page — Lists all products for this tenant from the DB.
 */
export default async function CatalogPage({
  params,
}: {
  params: Promise<{ tenant_slug: string }>;
}) {
  const { tenant_slug } = await params;

  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.slug, tenant_slug),
  });
  if (!tenant) redirect('/sign-in');

  const productList = await db.query.products.findMany({
    where: eq(products.tenantId, tenant.id),
    orderBy: [desc(products.createdAt)],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-1">
            Manage your product catalog ({productList.length} items)
          </p>
        </div>
      </div>

      <ProductListToolbar tenantSlug={tenant_slug} />
      <ProductListTable
        products={productList}
        tenantSlug={tenant_slug}
      />
    </div>
  );
}
