import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { tenants, categories } from '@/lib/db/schemas';
import { redirect } from 'next/navigation';
import { ProductFormShell } from '@/components/features/dashboard/catalog/product-form-shell';

/**
 * Create Product Page — Fetches tenant + categories, renders the product form.
 */
export default async function CreateProductPage({
  params,
}: {
  params: Promise<{ tenant_slug: string }>;
}) {
  const { tenant_slug } = await params;

  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.slug, tenant_slug),
  });
  if (!tenant) redirect('/sign-in');

  const categoryList = await db.query.categories.findMany({
    where: eq(categories.tenantId, tenant.id),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Product</h1>
        <p className="text-muted-foreground mt-1">
          Add a new product to your catalog
        </p>
      </div>

      <ProductFormShell
        tenantId={tenant.id}
        tenantSlug={tenant_slug}
        categories={categoryList.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}
