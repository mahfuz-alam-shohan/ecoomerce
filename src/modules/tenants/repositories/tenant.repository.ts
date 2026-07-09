import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { tenants } from '@/lib/db/schemas';

/**
 * Tenant Repository — Pure database queries for tenant resolution.
 */

export async function findTenantBySlug(slug: string) {
  return db.query.tenants.findFirst({
    where: eq(tenants.slug, slug),
  });
}

export async function findTenantByCustomDomain(domain: string) {
  return db.query.tenants.findFirst({
    where: eq(tenants.customDomain, domain),
  });
}

export async function findTenantById(tenantId: string) {
  return db.query.tenants.findFirst({
    where: eq(tenants.id, tenantId),
  });
}

export async function findAllActiveTenants() {
  return db
    .select()
    .from(tenants)
    .where(eq(tenants.status, 'active'));
}
