export const runtime = 'edge';

import { NextRequest } from 'next/server';
import { requireRole, AuthError } from '@/lib/auth/guards';
import { insertTenant, updateTenant, deleteTenant, findTenantBySlug } from '@/modules/tenants/repositories';
import { apiCreated, apiSuccess, apiError } from '@/lib/utils';
import { z } from 'zod';

/**
 * Tenant Management API — Super Admin Only
 *
 * POST   /api/v1/tenant/manage   → Create a new tenant (store)
 * PATCH  /api/v1/tenant/manage   → Update an existing tenant
 * DELETE /api/v1/tenant/manage   → Delete a tenant
 */

const createTenantSchema = z.object({
  name: z.string().min(2, 'Store name must be at least 2 characters').max(255),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(100)
    .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, 'Slug must be lowercase alphanumeric with optional hyphens'),
  customDomain: z.string().max(255).optional().nullable(),
  status: z.enum(['active', 'suspended', 'maintenance']).optional(),
  themeConfig: z
    .object({
      templateId: z.string().optional(),
      primaryColor: z.string().optional(),
      secondaryColor: z.string().optional(),
      accentColor: z.string().optional(),
      fontFamily: z.string().optional(),
      logoUrl: z.string().optional(),
      customCss: z.string().optional(),
    })
    .optional(),
  storeConfig: z
    .object({
      currency: z.string().optional(),
      taxRatePercent: z.number().optional(),
      freeShippingThresholdCents: z.number().optional(),
      features: z
        .object({
          enableCod: z.boolean().optional(),
          enableBankTransfer: z.boolean().optional(),
          enableSandboxPay: z.boolean().optional(),
        })
        .optional(),
    })
    .optional(),
});

const updateTenantSchema = z.object({
  tenantId: z.string().uuid('Invalid tenant ID'),
  name: z.string().min(2).max(255).optional(),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/)
    .optional(),
  customDomain: z.string().max(255).optional().nullable(),
  status: z.enum(['active', 'suspended', 'maintenance']).optional(),
  themeConfig: z.any().optional(),
  storeConfig: z.any().optional(),
});

export async function POST(request: NextRequest) {
  try {
    await requireRole('super_admin');

    const body = await request.json();
    const validated = createTenantSchema.parse(body);

    // Check slug uniqueness
    const existing = await findTenantBySlug(validated.slug);
    if (existing) {
      return apiError(`A store with slug "${validated.slug}" already exists`, 409);
    }

    const tenant = await insertTenant(validated as any);
    return apiCreated(tenant);
  } catch (err) {
    if (err instanceof AuthError) return apiError(err.message, err.statusCode);
    if ((err as any)?.name === 'ZodError') {
      return apiError(`Validation failed: ${(err as any).errors?.[0]?.message}`, 422);
    }
    console.error('[Create Tenant Error]', err);
    return apiError('Failed to create tenant', 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireRole('super_admin');

    const body = await request.json();
    const { tenantId, ...updates } = updateTenantSchema.parse(body);

    const tenant = await updateTenant(tenantId, updates as any);
    if (!tenant) return apiError('Tenant not found', 404);

    return apiSuccess(tenant);
  } catch (err) {
    if (err instanceof AuthError) return apiError(err.message, err.statusCode);
    if ((err as any)?.name === 'ZodError') {
      return apiError(`Validation failed: ${(err as any).errors?.[0]?.message}`, 422);
    }
    return apiError('Failed to update tenant', 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireRole('super_admin');

    const { searchParams } = request.nextUrl;
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) return apiError('tenantId query parameter is required');

    await deleteTenant(tenantId);
    return apiSuccess({ deleted: true });
  } catch (err) {
    if (err instanceof AuthError) return apiError(err.message, err.statusCode);
    return apiError('Failed to delete tenant', 500);
  }
}
