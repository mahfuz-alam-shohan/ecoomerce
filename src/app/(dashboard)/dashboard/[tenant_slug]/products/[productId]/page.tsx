import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { products, tenants, categories, variants } from '@/lib/db/schemas';
import { redirect } from 'next/navigation';
import { ProductFormShell } from '@/components/features/dashboard/catalog/product-form-shell';
import { VariantMatrixTable } from '@/components/features/dashboard/catalog/variant-matrix-table';

/**
 * Edit Product Page — Fetches real product + variants + categories.
 */
export default async function EditProductPage({
  params,
}: {
  params: Promise<{ tenant_slug: string; productId: string }>;
}) {
  const { tenant_slug, productId } = await params;

  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.slug, tenant_slug),
  });
  if (!tenant) redirect('/sign-in');

  const product = await db.query.products.findFirst({
    where: eq(products.id, productId),
  });
  if (!product || product.tenantId !== tenant.id) redirect(`/dashboard/${tenant_slug}/catalog`);

  const categoryList = await db.query.categories.findMany({
    where: eq(categories.tenantId, tenant.id),
  });

  const variantList = await db.query.variants.findMany({
    where: eq(variants.productId, productId),
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
        <p className="text-muted-foreground mt-1">{product.title}</p>
      </div>

      <ProductFormShell
        tenantId={tenant.id}
        tenantSlug={tenant_slug}
        categories={categoryList.map((c) => ({ id: c.id, name: c.name }))}
        initialData={{
          id: product.id,
          title: product.title,
          handle: product.handle,
          description: product.description,
          categoryId: product.categoryId,
          productType: product.productType,
          status: product.status,
          tags: product.tags,
          seoTitle: product.seoTitle,
          seoDescription: product.seoDescription,
        }}
      />

      <div>
        <h2 className="text-xl font-semibold mb-4">
          Variants ({variantList.length})
        </h2>
        <VariantMatrixTable variants={variantList} />
      </div>
    </div>
  );
}
