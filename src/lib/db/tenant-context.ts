import { eq, SQL, type AnyColumn } from 'drizzle-orm';
import { db } from './index';
import { tenants } from './schemas/tenants.schema';

/**
 * Tenant Context Wrapper
 * Ensures strict Row-Level / Application-Level Multi-Tenant Isolation.
 * Every query executed inside tenant context injects the active tenantId boundary.
 */

export interface TenantContext {
  tenantId: string;
  slug: string;
  customDomain?: string | null;
}

/**
 * Scopes a Drizzle query condition to the active tenant ID.
 * Example usage: db.select().from(products).where(and(eq(products.status, 'active'), withTenant(tenantId, products.tenantId)))
 */
export function withTenant(
  tenantId: string,
  tenantIdColumn: AnyColumn
): SQL {
  return eq(tenantIdColumn, tenantId);
}

/**
 * Resolves a tenant by either exact domain name or slug.
 */
export async function resolveTenantByHost(host: string): Promise<TenantContext | null> {
  const cleanHost = host.replace(/:\d+$/, ''); // Strip port if localhost:3000

  // 1. Check custom domain first
  const byDomain = await db.query.tenants.findFirst({
    where: eq(tenants.customDomain, cleanHost),
  });
  if (byDomain) {
    return {
      tenantId: byDomain.id,
      slug: byDomain.slug,
      customDomain: byDomain.customDomain,
    };
  }

  // 2. Check subdomain slug (e.g., electronics.ourplatform.com -> electronics)
  const parts = cleanHost.split('.');
  if (parts.length > 1 && parts[0] !== 'www' && parts[0] !== 'app') {
    const slug = parts[0];
    const bySlug = await db.query.tenants.findFirst({
      where: eq(tenants.slug, slug),
    });
    if (bySlug) {
      return {
        tenantId: bySlug.id,
        slug: bySlug.slug,
        customDomain: bySlug.customDomain,
      };
    }
  }

  return null;
}
