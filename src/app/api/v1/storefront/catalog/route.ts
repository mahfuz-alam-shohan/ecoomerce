import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, variants, categories } from '@/lib/db/schemas';
import { eq, and, like, desc, asc, sql, inArray } from 'drizzle-orm';

/**
 * Headless Storefront Catalog API
 * GET /api/v1/storefront/catalog?tenantId=...&categoryId=...&sort=...&search=...&page=1&limit=24
 *
 * Powers category pages, product grids, search bars, price sliders, and sort switchers
 * across all decoupled public storefront apps.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId');
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search')?.trim();
    const sort = searchParams.get('sort') || 'newest';
    const minPrice = parseInt(searchParams.get('minPrice') || '0', 10);
    const maxPrice = parseInt(searchParams.get('maxPrice') || '0', 10);
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '24', 10), 1), 100);
    const offset = (page - 1) * limit;

    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameter: ?tenantId=' },
        { status: 400 }
      );
    }

    // Build query conditions
    const conditions = [
      eq(products.tenantId, tenantId),
      sql`(${products.status} = 'published' OR ${products.status} = 'active')`,
    ];

    if (categoryId && categoryId !== 'all') {
      conditions.push(eq(products.categoryId, categoryId));
    }

    if (search) {
      conditions.push(
        sql`(lower(${products.title}) LIKE ${`%${search.toLowerCase()}%`} OR lower(${products.description}) LIKE ${`%${search.toLowerCase()}%`})`
      );
    }

    // Fetch matching products
    const rawProducts = await db
      .select({
        id: products.id,
        tenantId: products.tenantId,
        categoryId: products.categoryId,
        title: products.title,
        handle: products.handle,
        description: products.description,
        images: products.images,
        tags: products.tags,
        createdAt: products.createdAt,
      })
      .from(products)
      .where(and(...conditions))
      .limit(limit)
      .offset(offset);

    // Fetch variants for all returned products to get pricing and stock
    const productIds = rawProducts.map((p) => p.id);
    let allVariants: typeof variants.$inferSelect[] = [];
    if (productIds.length > 0) {
      allVariants = await db
        .select()
        .from(variants)
        .where(inArray(variants.productId, productIds));
    }

    // Map products with their variants and lowest price
    const enrichedProducts = rawProducts.map((p) => {
      const pVariants = allVariants.filter((v) => v.productId === p.id && v.isActive);
      const minPriceInCents = pVariants.length > 0
        ? Math.min(...pVariants.map((v) => v.priceInCents))
        : 0;
      const maxPriceInCents = pVariants.length > 0
        ? Math.max(...pVariants.map((v) => v.priceInCents))
        : 0;
      const totalStock = pVariants.reduce((sum, v) => sum + v.stockQuantity, 0);

      return {
        ...p,
        variants: pVariants.map((v) => ({
          id: v.id,
          sku: v.sku,
          title: v.title,
          options: v.options,
          priceInCents: v.priceInCents,
          compareAtPriceInCents: v.compareAtPriceInCents,
          stockQuantity: v.stockQuantity,
        })),
        minPriceInCents,
        maxPriceInCents,
        totalStock,
      };
    });

    // Filter by price range if requested
    let filteredProducts = enrichedProducts;
    if (minPrice > 0) {
      filteredProducts = filteredProducts.filter((p) => p.minPriceInCents >= minPrice * 100);
    }
    if (maxPrice > 0) {
      filteredProducts = filteredProducts.filter((p) => p.minPriceInCents <= maxPrice * 100);
    }

    // Apply sorting
    if (sort === 'price_asc') {
      filteredProducts.sort((a, b) => a.minPriceInCents - b.minPriceInCents);
    } else if (sort === 'price_desc') {
      filteredProducts.sort((a, b) => b.minPriceInCents - a.minPriceInCents);
    } else if (sort === 'newest') {
      filteredProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // Also get all categories for this tenant to populate category filters
    const tenantCategories = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
      })
      .from(categories)
      .where(eq(categories.tenantId, tenantId));

    return NextResponse.json({
      success: true,
      data: {
        products: filteredProducts,
        categories: tenantCategories,
        pagination: {
          page,
          limit,
          total: filteredProducts.length,
        },
      },
    });
  } catch (error: any) {
    console.error('Storefront catalog error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error fetching catalog' },
      { status: 500 }
    );
  }
}
