
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/guards';

/**
 * Root Page — Smart redirect based on authentication state.
 *
 * - Not logged in → /sign-in
 * - Super admin → /platform
 * - Tenant owner → /dashboard/[their-tenant-slug]
 */
export const dynamic = 'force-dynamic';

export default async function RootPage() {
  const session = await getSession();

  if (!session) {
    redirect('/sign-in');
  }

  const user = session.user;

  if (user.role === 'super_admin') {
    redirect('/platform');
  }

  // For tenant users, we need to look up their tenant slug
  if (user.tenantId) {
    // Import here to avoid circular deps in edge runtime
    const { eq } = await import('drizzle-orm');
    const { db } = await import('@/lib/db');
    const { tenants } = await import('@/lib/db/schemas');

    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.id, user.tenantId),
    });

    if (tenant) {
      redirect(`/dashboard/${tenant.slug}`);
    }
  }

  redirect('/sign-in');
}
