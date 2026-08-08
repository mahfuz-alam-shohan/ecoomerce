import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tenants, orders, orderItems, variants, products } from '@/lib/db/schemas';
import { eq, inArray, or } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantId, apiKey, customer, items, paymentMethod, notes } = body;

    // 1. Resolve tenant
    if (!tenantId && !apiKey) {
      return NextResponse.json({ success: false, error: 'Missing tenantId or apiKey' }, { status: 400 });
    }

    const conditions = [];
    if (tenantId) conditions.push(eq(tenants.id, tenantId));
    if (apiKey) conditions.push(eq(tenants.storefrontApiKey, apiKey));

    const [tenant] = await db.select().from(tenants).where(or(...conditions)).limit(1);

    if (!tenant || tenant.status !== 'active') {
      return NextResponse.json({ success: false, error: 'Storefront inactive or not found' }, { status: 404 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Cart is empty' }, { status: 400 });
    }

    if (!customer?.email || !customer?.fullName || !customer?.addressLine1) {
      return NextResponse.json({ success: false, error: 'Missing required shipping address fields' }, { status: 400 });
    }

    // 2. Fetch live variants from DB to verify exact prices & stock
    const variantIds = items.map((i: any) => i.variantId).filter(Boolean);
    if (variantIds.length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid cart items' }, { status: 400 });
    }

    const dbVariants = await db
      .select({
        id: variants.id,
        sku: variants.sku,
        title: variants.title,
        priceInCents: variants.priceInCents,
        stockQuantity: variants.stockQuantity,
        productId: variants.productId,
        productTitle: products.title,
        productImage: products.images,
      })
      .from(variants)
      .leftJoin(products, eq(variants.productId, products.id))
      .where(inArray(variants.id, variantIds));

    const variantMap = new Map(dbVariants.map((v) => [v.id, v]));

    let subtotalInCents = 0;
    const validatedItems = [];

    for (const item of items) {
      const v = variantMap.get(item.variantId);
      if (!v) {
        return NextResponse.json({ success: false, error: `Variant ${item.variantId} not found` }, { status: 400 });
      }

      const qty = Number(item.quantity) || 1;
      if (qty <= 0) continue;

      if (v.stockQuantity < qty) {
        return NextResponse.json({
          success: false,
          error: `Insufficient stock for ${v.productTitle} (${v.title}). Only ${v.stockQuantity} available.`,
        }, { status: 400 });
      }

      const itemTotal = v.priceInCents * qty;
      subtotalInCents += itemTotal;

      validatedItems.push({
        productId: v.productId,
        variantId: v.id,
        title: `${v.productTitle} - ${v.title}`,
        sku: v.sku || 'N/A',
        quantity: qty,
        unitPriceInCents: v.priceInCents,
        totalPriceInCents: itemTotal,
        imageUrl: Array.isArray(v.productImage) && v.productImage.length > 0 ? v.productImage[0] : null,
      });
    }

    // 3. Compute tax & shipping based on storeConfig
    const taxRate = tenant.storeConfig?.taxRatePercent || 0;
    const taxInCents = Math.round(subtotalInCents * (taxRate / 100));

    const freeThreshold = tenant.storeConfig?.freeShippingThresholdCents ?? 10000;
    const shippingInCents = subtotalInCents >= freeThreshold ? 0 : 1200; // $12 standard if under threshold

    const totalAmountInCents = subtotalInCents + taxInCents + shippingInCents;

    // 4. Generate unique Order Number
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    // 5. Insert Order Header inside transaction
    const [insertedOrder] = await db
      .insert(orders)
      .values({
        tenantId: tenant.id,
        orderNumber,
        status: paymentMethod === 'cod' ? 'pending' : 'payment_verified',
        customerEmail: customer.email,
        customerName: customer.fullName,
        paymentMethod: paymentMethod || 'cod',
        subtotalInCents,
        taxInCents,
        shippingInCents,
        discountInCents: 0,
        totalAmountInCents,
        currency: tenant.storeConfig?.currency || 'USD',
        shippingAddress: {
          fullName: customer.fullName,
          phone: customer.phone || '',
          addressLine1: customer.addressLine1,
          addressLine2: customer.addressLine2 || '',
          city: customer.city || '',
          state: customer.state || '',
          postalCode: customer.postalCode || '',
          country: customer.country || 'USA',
        },
        billingAddress: {
          fullName: customer.fullName,
          phone: customer.phone || '',
          addressLine1: customer.addressLine1,
          addressLine2: customer.addressLine2 || '',
          city: customer.city || '',
          state: customer.state || '',
          postalCode: customer.postalCode || '',
          country: customer.country || 'USA',
        },
        notes: notes || null,
      })
      .returning();

    // 6. Insert Order Items
    for (const item of validatedItems) {
      await db.insert(orderItems).values({
        orderId: insertedOrder.id,
        productId: item.productId,
        variantId: item.variantId,
        title: item.title,
        sku: item.sku,
        quantity: item.quantity,
        unitPriceInCents: item.unitPriceInCents,
        totalPriceInCents: item.totalPriceInCents,
        imageUrl: item.imageUrl,
      });

      // Decrement inventory stock directly
      const currentStock = variantMap.get(item.variantId!)?.stockQuantity || 0;
      await db
        .update(variants)
        .set({ stockQuantity: Math.max(0, currentStock - item.quantity) })
        .where(eq(variants.id, item.variantId!));
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: insertedOrder.id,
        orderNumber: insertedOrder.orderNumber,
        totalAmountInCents: insertedOrder.totalAmountInCents,
        status: insertedOrder.status,
      },
    });
  } catch (error: any) {
    console.error('Storefront checkout API error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error during checkout' }, { status: 500 });
  }
}
