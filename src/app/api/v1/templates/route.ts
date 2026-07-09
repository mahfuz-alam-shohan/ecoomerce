import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { storefrontTemplates } from '@/lib/db/schemas';
import { apiSuccess, apiError } from '@/lib/utils';

/**
 * Templates API — Public Registry
 *
 * GET /api/v1/templates          → List all active templates
 * GET /api/v1/templates?slug=xxx → Get a specific template by slug
 *
 * This is a public endpoint. Merchants use it to browse available
 * storefront templates from the dashboard. The storefront engine
 * uses it to resolve which template component to render.
 *
 * To add a new template:
 *   1. Create components in src/components/templates/[slug]/
 *   2. Insert a row into the storefront_templates table
 *   3. Done — tenants can select it immediately
 */

export async function GET(request: NextRequest) {
  try {
    const slug = request.nextUrl.searchParams.get('slug');

    if (slug) {
      const template = await db.query.storefrontTemplates.findFirst({
        where: eq(storefrontTemplates.slug, slug),
      });

      if (!template) return apiError('Template not found', 404);
      return apiSuccess(template);
    }

    // List all active templates
    const templates = await db
      .select()
      .from(storefrontTemplates)
      .where(eq(storefrontTemplates.isActive, true))
      .orderBy(storefrontTemplates.name);

    return apiSuccess(templates);
  } catch (err) {
    return apiError('Failed to fetch templates', 500);
  }
}
