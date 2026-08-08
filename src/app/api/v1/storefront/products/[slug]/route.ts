import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, variants, categories } from '@/lib/db/schemas';
import { eq, and, ne } from 'drizzle-orm';

/**
 * Headless Single Product & Variant API
 * GET /api/v1/storefront/products/luxury-watch?tenantId=...
 *
 * Powers single product detail pages (`/product/[slug]`), interactive variant pickers,
 * live stock indicators, and "You May Also Like" related product sliders.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId || !slug) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: ?tenantId= and slug' },
        { status: 400 }
      );
    }

    // Fetch product by handle or ID
    const [product] = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.tenantId, tenantId),
          eq(products.handle, slug),
          eq(products.status, 'active')
        )
      )
      .limit(1);

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Fetch active variants for this product
    const productVariants = await db
      .select()
      .from(variants)
      .where(and(eq(variants.productId, product.id), eq(variants.isActive, true)));

    // Fetch category metadata if assigned
    let categoryMeta = null;
    if (product.categoryId) {
      const [cat] = await db
        .select()
        .from(categories)
        .where(eq(categories.id, product.categoryId))
        .limit(1);
      if (cat) {
        categoryMeta = { id: cat.id, name: cat.name, slug: cat.slug };
      }
    }

    // Fetch related products (same category, excluding current product)
    let relatedProducts: any[] = [];
    if (product.categoryId) {
      const rawRelated = await db
        .select({
          id: products.id,
          title: products.title,
          handle: products.handle,
          images: products.images,
          createdAt: products.createdAt,
        })
        .from(products)
        .where(
          and(
            eq(products.tenantId, tenantId),
            eq(products.categoryId, product.categoryId),
            eq(products.status, 'active'),
            ne(products.id, product.id)
          )
        )
        .limit(4);

      // Get prices for related products
      for (const rel of rawRelated) {
        const relVars = await db
          .select({ priceInCents: variants.priceInCents })
          .from(variants)
          .where(and(eq(variants.productId, rel.id), eq(variants.isActive, true)));

        const minPriceInCents = relVars.length > 0
          ? Math.min(...relVars.map((v) => v.priceInCents))
          : 0;

        relatedProducts.push({ ...rel, minPriceInCents });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        product: {
          ...product,
          category: categoryMeta,
          variants: productVariants.map((v) => ({
            id: v.id,
            sku: v.sku,
            title: v.title,
            options: v.options,
            priceInCents: v.priceInCents,
            compareAtPriceInCents: v.compareAtPriceInCents,
            stockQuantity: v.stockQuantity,
            isDigital: v.isDigital,
          })),
        },
        relatedProducts,
      },
    });
  } catch (error: any) {
    console.error('Storefront single product error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error fetching product details' },
      { status: 500 }
    );
  }
}
