import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tenants } from '@/lib/db/schemas';
import { eq, or, sql } from 'drizzle-orm';

/**
 * Headless Storefront Resolution API
 * GET /api/v1/storefront/resolve?host=www.acmestore.com
 * GET /api/v1/storefront/resolve?slug=default-store
 *
 * Used by our Decoupled Public Storefront applications (Edge/Next.js) to dynamically
 * resolve which tenant owns the custom domain or slug and fetch 100% of their dynamic
 * theme (`ThemeConfig`), store rules (`StoreConfig`), and content (`StorefrontContentConfig`).
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const host = searchParams.get('host');
    const slug = searchParams.get('slug');
    const apiKey = searchParams.get('apiKey') || req.headers.get('x-storefront-token') || req.headers.get('authorization')?.replace('Bearer ', '');

    if (!host && !slug && !apiKey) {
      return NextResponse.json(
        { success: false, error: 'Missing parameter: must provide ?host=, ?slug=, or ?apiKey= (or X-Storefront-Token header)' },
        { status: 400 }
      );
    }

    // Clean domain (remove port, www. or protocol if passed)
    let cleanHost = host?.replace(/^https?:\/\//, '').replace(/^www\./, '').split(':')[0] || null;

    const conditions = [];
    if (cleanHost) {
      conditions.push(sql`lower(${tenants.customDomain}) = lower(${cleanHost})`);
    }
    if (slug) {
      conditions.push(eq(tenants.slug, slug));
    }
    if (apiKey) {
      conditions.push(eq(tenants.storefrontApiKey, apiKey));
    }

    const [tenant] = await db
      .select({
        id: tenants.id,
        slug: tenants.slug,
        customDomain: tenants.customDomain,
        name: tenants.name,
        status: tenants.status,
        storefrontApiKey: tenants.storefrontApiKey,
        themeConfig: tenants.themeConfig,
        storeConfig: tenants.storeConfig,
        storefrontConfig: tenants.storefrontConfig,
      })
      .from(tenants)
      .where(or(...conditions))
      .limit(1);

    if (!tenant || tenant.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Storefront not found or suspended' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        tenantId: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        customDomain: tenant.customDomain,
        themeConfig: tenant.themeConfig,
        storeConfig: tenant.storeConfig,
        storefrontConfig: tenant.storefrontConfig,
      },
    });
  } catch (error: any) {
    console.error('Storefront resolve error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error resolving storefront' },
      { status: 500 }
    );
  }
}
