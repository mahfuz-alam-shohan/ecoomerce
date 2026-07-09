
import { NextRequest } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { categories } from '@/lib/db/schemas';
import { withTenant } from '@/lib/db/tenant-context';
import { apiSuccess, apiCreated, apiError } from '@/lib/utils';

/**
 * Categories API — Centralized Dashboard + Storefront
 *
 * GET  /api/v1/categories?tenantId=xxx  → List categories (public for storefront filters)
 * POST /api/v1/categories               → Create category (dashboard, auth required)
 */

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.nextUrl.searchParams.get('tenantId');
    if (!tenantId) return apiError('tenantId is required');

    const cats = await db
      .select()
      .from(categories)
      .where(withTenant(tenantId, categories.tenantId))
      .orderBy(categories.sortOrder);

    return apiSuccess(cats);
  } catch (err) {
    return apiError('Failed to fetch categories', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.tenantId || !body.name) {
      return apiError('tenantId and name are required');
    }

    const [category] = await db
      .insert(categories)
      .values({
        tenantId: body.tenantId,
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-'),
        description: body.description,
        parentId: body.parentId,
        imageUrl: body.imageUrl,
        sortOrder: body.sortOrder || 0,
      })
      .returning();

    return apiCreated(category);
  } catch (err) {
    return apiError('Failed to create category', 500);
  }
}
