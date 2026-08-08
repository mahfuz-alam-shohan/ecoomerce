import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { tenants } from '@/lib/db/schemas';
import { getSession } from '@/lib/auth/guards';

export const dynamic = 'force-dynamic';

/**
 * Dashboard root index page — automatically redirects authenticated users
 * to their specific tenant dashboard `/dashboard/[tenant_slug]`.
 */
export default async function DashboardIndexPage() {
  const session = await getSession();
  if (!session) {
    redirect('/sign-in');
  }

  const user = session.user;
  if (user.role === 'super_admin') {
    redirect('/platform');
  }

  if (user.tenantId) {
    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.id, user.tenantId),
    });
    if (tenant) {
      redirect(`/dashboard/${tenant.slug}`);
    }
  }

  redirect('/');
}
