import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { categories, tenants } from '@/lib/db/schemas';
import { redirect } from 'next/navigation';
import { CategoryListTable } from '@/components/features/dashboard/catalog/category-list-table';
import { CreateCategoryModal } from '@/components/features/dashboard/catalog/create-category-modal';

/**
 * Categories Page — Fetches real categories from DB.
 */
export default async function CategoriesPage({
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
    orderBy: [categories.sortOrder],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground mt-1">
            Organize your products ({categoryList.length} categories)
          </p>
        </div>
        <CreateCategoryModal tenantId={tenant.id} />
      </div>
      <CategoryListTable categories={categoryList} />
    </div>
  );
}
