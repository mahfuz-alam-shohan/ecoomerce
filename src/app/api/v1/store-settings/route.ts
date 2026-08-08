
import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { tenants } from '@/lib/db/schemas';
import { requireTenantAccess, AuthError } from '@/lib/auth/guards';
import { apiSuccess, apiError } from '@/lib/utils';

/**
 * Store Settings API — Centralized Dashboard
 *
 * GET /api/v1/store-settings?tenantId=xxx
 * PUT /api/v1/store-settings  { tenantId, themeConfig?, storeConfig? }
 *
 * Allows merchants to update their store theme (templateId, colors, fonts)
 * and store config (currency, tax, shipping rules) from the dashboard.
 */

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.nextUrl.searchParams.get('tenantId');
    if (!tenantId) return apiError('tenantId is required');

    await requireTenantAccess(tenantId);

    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.id, tenantId),
    });

    if (!tenant) return apiError('Tenant not found', 404);

    return apiSuccess({
      themeConfig: tenant.themeConfig,
      storeConfig: tenant.storeConfig,
      storefrontConfig: tenant.storefrontConfig,
    });
  } catch (err) {
    if (err instanceof AuthError) return apiError(err.message, err.statusCode);
    return apiError('Failed to fetch store settings', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.tenantId) return apiError('tenantId is required');

    await requireTenantAccess(body.tenantId);

    const updateData: Record<string, any> = { updatedAt: new Date() };

    if (body.themeConfig) updateData.themeConfig = body.themeConfig;
    if (body.storeConfig) updateData.storeConfig = body.storeConfig;
    if (body.storefrontConfig) updateData.storefrontConfig = body.storefrontConfig;

    const [updated] = await db
      .update(tenants)
      .set(updateData)
      .where(eq(tenants.id, body.tenantId))
      .returning();

    if (!updated) return apiError('Tenant not found', 404);

    return apiSuccess({
      themeConfig: updated.themeConfig,
      storeConfig: updated.storeConfig,
      storefrontConfig: updated.storefrontConfig,
    });
  } catch (err) {
    if (err instanceof AuthError) return apiError(err.message, err.statusCode);
    return apiError('Failed to update store settings', 500);
  }
}
