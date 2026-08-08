import { NextRequest } from 'next/server';
import { requireRole, AuthError } from '@/lib/auth/guards';
import { insertTenant, updateTenant, deleteTenant, findTenantBySlug } from '@/modules/tenants/repositories';
import { apiCreated, apiSuccess, apiError } from '@/lib/utils';
import { z, ZodError } from 'zod';
import type { NewTenant, ThemeConfig, StoreConfig } from '@/lib/db/schemas';
import { auth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schemas';
import { eq } from 'drizzle-orm';

/**
 * Tenant Management API — Super Admin Only
 *
 * POST   /api/v1/tenant/manage   → Create a new tenant (store) + optional initial owner
 * PATCH  /api/v1/tenant/manage   → Update an existing tenant
 * DELETE /api/v1/tenant/manage   → Delete a tenant
 */

const createTenantSchema = z.object({
  name: z.string().min(2, 'Store name must be at least 2 characters').max(255),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(100)
    .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, 'Slug must be URL-safe (e.g., "blue-running-shoes")'),
  customDomain: z.string().max(255).optional().nullable(),
  status: z.enum(['active', 'suspended', 'maintenance']).default('active'),
  themeConfig: z.custom<ThemeConfig>().optional(),
  storeConfig: z.custom<StoreConfig>().optional(),
  ownerEmail: z.string().email('Invalid owner email address').optional(),
  ownerPassword: z.string().min(6, 'Owner password must be at least 6 characters').optional(),
  ownerName: z.string().min(2, 'Owner name must be at least 2 characters').optional(),
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
  themeConfig: z.custom<ThemeConfig>().optional(),
  storeConfig: z.custom<StoreConfig>().optional(),
});

export async function POST(request: NextRequest) {
  try {
    await requireRole('super_admin');

    const body = await request.json();
    const validated = createTenantSchema.parse(body);
    const { ownerEmail, ownerPassword, ownerName, ...tenantData } = validated;

    // Check slug uniqueness
    const existing = await findTenantBySlug(tenantData.slug);
    if (existing) {
      return apiError(`A store with slug "${tenantData.slug}" already exists`, 409);
    }

    const tenant = await insertTenant(tenantData as unknown as NewTenant);

    // If initial store owner credentials are provided, create the tenant owner account right away
    let owner = null;
    if (ownerEmail && ownerPassword) {
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, ownerEmail),
      });

      const finalOwnerName = ownerName || `${tenantData.name} Owner`;

      if (existingUser) {
        await db.update(users).set({
          role: 'tenant_owner',
          tenantId: tenant.id,
          isActive: true,
        }).where(eq(users.email, ownerEmail));
        owner = { id: existingUser.id, email: ownerEmail, name: existingUser.name, role: 'tenant_owner', tenantId: tenant.id };
      } else {
        await auth.api.signUpEmail({
          body: {
            email: ownerEmail,
            password: ownerPassword,
            name: finalOwnerName,
          },
        });
        await db.update(users).set({
          role: 'tenant_owner',
          tenantId: tenant.id,
          isActive: true,
        }).where(eq(users.email, ownerEmail));
        owner = { email: ownerEmail, name: finalOwnerName, role: 'tenant_owner', tenantId: tenant.id };
      }
    }

    return apiCreated({ ...tenant, owner });
  } catch (err) {
    if (err instanceof AuthError) return apiError(err.message, err.statusCode);
    if (err instanceof ZodError) {
      return apiError(`Validation failed: ${err.issues?.[0]?.message}`, 422);
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

    const tenant = await updateTenant(tenantId, updates as Partial<NewTenant>);
    if (!tenant) return apiError('Tenant not found', 404);

    return apiSuccess(tenant);
  } catch (err) {
    if (err instanceof AuthError) return apiError(err.message, err.statusCode);
    if (err instanceof ZodError) {
      return apiError(`Validation failed: ${err.issues?.[0]?.message}`, 422);
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
