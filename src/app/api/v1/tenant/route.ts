export const runtime = 'edge';

import { NextRequest } from 'next/server';
import { resolveTenantByHost } from '@/modules/tenants/use-cases';
import { apiSuccess, apiError } from '@/lib/utils';

/**
 * Tenant Resolution API — Public Storefront
 *
 * GET /api/v1/tenant?slug=electronics
 * GET /api/v1/tenant?domain=www.mystore.com
 *
 * Returns the tenant's configuration, active template, and store settings.
 * Used by storefront pages to fetch tenant data for rendering.
 * This endpoint is public (no auth required).
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const slug = searchParams.get('slug');
    const domain = searchParams.get('domain');

    if (!slug && !domain) {
      return apiError('Either slug or domain query parameter is required');
    }

    // Construct a fake host for our resolver
    const host = domain || `${slug}.platform.com`;
    const tenant = await resolveTenantByHost(host);

    if (!tenant) {
      return apiError('Store not found', 404);
    }

    return apiSuccess(tenant);
  } catch (err) {
    return apiError('Failed to resolve tenant', 500);
  }
}
