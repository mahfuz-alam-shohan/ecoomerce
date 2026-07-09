import { eq, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { tenants, type NewTenant } from '@/lib/db/schemas';

/**
 * Tenant Repository — Pure database queries for tenant CRUD.
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

export async function findAllTenants() {
  return db.select().from(tenants).orderBy(desc(tenants.createdAt));
}

export async function findAllActiveTenants() {
  return db
    .select()
    .from(tenants)
    .where(eq(tenants.status, 'active'));
}

export async function insertTenant(data: NewTenant) {
  const [tenant] = await db.insert(tenants).values(data).returning();
  return tenant;
}

export async function updateTenant(tenantId: string, data: Partial<NewTenant>) {
  const [tenant] = await db
    .update(tenants)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(tenants.id, tenantId))
    .returning();
  return tenant;
}

export async function deleteTenant(tenantId: string) {
  await db.delete(tenants).where(eq(tenants.id, tenantId));
}
