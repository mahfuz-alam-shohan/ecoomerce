import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { tenants, storefrontTemplates } from '@/lib/db/schemas';
import { redirect } from 'next/navigation';
import { StoreSettingsForm } from '@/components/features/dashboard/settings/store-settings-form';

/**
 * Store Settings Page — Fetches real tenant config + available templates.
 */
export default async function SettingsPage({
  params,
}: {
  params: Promise<{ tenant_slug: string }>;
}) {
  const { tenant_slug } = await params;

  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.slug, tenant_slug),
  });
  if (!tenant) redirect('/sign-in');

  const templates = await db.query.storefrontTemplates.findMany({
    where: eq(storefrontTemplates.isActive, true),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Store Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure your store&apos;s appearance and business rules
        </p>
      </div>

      <StoreSettingsForm
        tenantId={tenant.id}
        themeConfig={tenant.themeConfig}
        storeConfig={tenant.storeConfig}
        templates={templates.map((t) => ({
          slug: t.slug,
          name: t.name,
          description: t.description,
        }))}
      />
    </div>
  );
}
