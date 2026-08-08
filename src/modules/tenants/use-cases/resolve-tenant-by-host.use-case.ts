import { cache } from 'react';
import { findTenantBySlug, findTenantByCustomDomain } from '../repositories';

/**
 * Resolve Tenant By Host Use-Case (Request-Scoped Deduplicated via `cache()`)
 *
 * Determines which tenant a request belongs to based on the incoming hostname.
 *
 * Strategy:
 * 1. Strip port from hostname (e.g., "electronics.localhost:3000" -> "electronics.localhost")
 * 2. First, check if the full hostname matches a custom domain in the tenants table.
 * 3. If no match, extract the first subdomain segment and look up by slug.
 * 4. Return tenant data or null if no tenant found.
 *
 * Wrapped with React `cache()` so that if `layout.tsx`, `Header`, and `Footer` all call
 * this function in the same request, Drizzle only hits PostgreSQL once!
 */
export const resolveTenantByHost = cache(async function resolveTenantByHost(host: string) {
  const cleanHost = host.replace(/:\d+$/, ''); // Strip port

  // 1. Try custom domain lookup first (e.g., "www.myaura-store.com")
  const byDomain = await findTenantByCustomDomain(cleanHost);
  if (byDomain && byDomain.status === 'active') {
    return {
      tenantId: byDomain.id,
      slug: byDomain.slug,
      name: byDomain.name,
      customDomain: byDomain.customDomain,
      themeConfig: byDomain.themeConfig,
      storeConfig: byDomain.storeConfig,
    };
  }

  // 2. Try subdomain slug lookup (e.g., "electronics" from "electronics.ecom.localhost")
  const parts = cleanHost.split('.');
  if (parts.length >= 2) {
    const subdomain = parts[0];

    // Skip reserved subdomains
    const reserved = ['www', 'app', 'api', 'dashboard', 'admin'];
    if (reserved.includes(subdomain)) return null;

    const bySlug = await findTenantBySlug(subdomain);
    if (bySlug && bySlug.status === 'active') {
      return {
        tenantId: bySlug.id,
        slug: bySlug.slug,
        name: bySlug.name,
        customDomain: bySlug.customDomain,
        themeConfig: bySlug.themeConfig,
        storeConfig: bySlug.storeConfig,
      };
    }
  }

  return null;
});
