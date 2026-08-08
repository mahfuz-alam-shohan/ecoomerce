
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { tenants } from '@/lib/db/schemas';
import { getSession } from '@/lib/auth/guards';
import { TenantProvider } from '@/lib/providers/tenant-provider';
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { PageTransition } from '@/components/ui/page-transition';

/**
 * Dashboard Layout — Real authentication + tenant resolution.
 *
 * 1. Validates the user's session via Better-Auth (redirect if not logged in)
 * 2. Resolves the tenant from URL slug against the database
 * 3. Verifies the user has access to this tenant
 * 4. Provides tenant + session context to all children
 */
export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenant_slug: string }>;
}) {
  // 1. Require authenticated session
  const session = await getSession();
  if (!session) {
    redirect('/sign-in');
  }

  // 2. Resolve tenant from URL slug
  const { tenant_slug } = await params;
  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.slug, tenant_slug),
  });

  if (!tenant) {
    redirect('/sign-in');
  }

  // 3. Verify tenant access (super_admin can access any tenant)
  const user = session.user;
  if (user.role !== 'super_admin' && user.tenantId !== tenant.id) {
    redirect('/');
  }

  // 4. Provide context to all children
  const contextValue = {
    tenant: {
      id: tenant.id,
      slug: tenant.slug,
      name: tenant.name,
      themeConfig: tenant.themeConfig,
      storeConfig: tenant.storeConfig,
    },
    session: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  };

  return (
    <TenantProvider value={contextValue}>
      <div className="flex h-screen overflow-hidden">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto p-6 flex flex-col">
            <PageTransition>
              {children}
            </PageTransition>
          </main>
        </div>
      </div>
    </TenantProvider>
  );
}
