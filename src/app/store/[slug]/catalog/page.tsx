import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { tenants, categories, products, variants } from '@/lib/db/schemas';
import { eq, and, sql, asc } from 'drizzle-orm';
import { Phone, Mail, Award, Package, ShieldCheck, Search, ShoppingCart, Home, Layers, Eye, SlidersHorizontal } from 'lucide-react';

export const revalidate = 0;

export default async function TenantStoreCatalog({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ search?: string; sort?: string; category?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const tenantSlug = resolvedParams.slug;

  const [tenant] = await db.select().from(tenants).where(eq(tenants.slug, tenantSlug)).limit(1);
  if (!tenant) notFound();

  const tenantCategories = await db.select().from(categories).where(eq(categories.tenantId, tenant.id)).orderBy(asc(categories.name));

  const conditions = [
    eq(products.tenantId, tenant.id),
    sql`(${products.status} = 'published' OR ${products.status} = 'active')`,
  ];

  if (resolvedSearch?.category) {
    const [catObj] = await db.select().from(categories).where(eq(categories.slug, resolvedSearch.category)).limit(1);
    if (catObj) conditions.push(eq(products.categoryId, catObj.id));
  }

  if (resolvedSearch?.search) {
    conditions.push(sql`lower(${products.title}) LIKE ${`%${resolvedSearch.search.toLowerCase()}%`}`);
  }

  const rawProducts = await db.select().from(products).where(and(...conditions)).limit(60);

  const productIds = rawProducts.map((p) => p.id);
  let allVariants: typeof variants.$inferSelect[] = [];
  if (productIds.length > 0) {
    allVariants = await db.select().from(variants).where(sql`${variants.productId} IN (${sql.join(productIds, sql`, `)})`);
  }

  const enrichedProducts = rawProducts.map((p) => {
    const pVariants = allVariants.filter((v) => v.productId === p.id);
    const minPriceInCents = pVariants.length > 0 ? Math.min(...pVariants.map((v) => v.priceInCents)) : 0;
    return {
      ...p,
      minPriceInCents,
      variants: pVariants,
    };
  });

  const currencySymbol = (tenant.storeConfig as any)?.currency === 'USD' ? '$' : 'BDT ';

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfc] text-gray-900 font-sans select-none">
      {/* Header */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4 sm:gap-8 w-full border-b border-gray-200 bg-white">
        <Link href={`/store/${tenant.slug}`} className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="text-2xl font-black text-[#1e3a8a] tracking-tighter uppercase">{tenant.name.split(' ')[0] || 'ROBOTICS'}</span>
            <span className="text-2xl font-black text-[#f97316] tracking-tighter uppercase">{tenant.name.split(' ').slice(1).join(' ') || 'BD'}</span>
          </div>
          <span className="text-[10px] font-bold text-sky-600 tracking-widest uppercase">DISCOVER YOURSELF</span>
        </Link>

        <form action={`/store/${tenant.slug}/catalog`} method="GET" className="hidden sm:flex flex-1 max-w-xl items-center border-2 border-gray-300 rounded overflow-hidden">
          <input type="text" name="search" defaultValue={resolvedSearch?.search || ''} placeholder="Search catalog..." className="flex-1 px-4 py-2 text-sm focus:outline-none" />
          <button type="submit" className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-2"><Search className="w-4 h-4" /></button>
        </form>

        <Link href={`/store/${tenant.slug}/cart`} className="flex items-center gap-2 bg-[#82c91e] text-white font-extrabold px-4 py-2.5 rounded text-xs">
          <ShoppingCart className="w-4 h-4" />
          <span>Cart</span>
        </Link>
      </header>

      {/* Dark Nav */}
      <nav className="w-full bg-[#1c1c1c] text-white text-xs font-bold tracking-wider uppercase">
        <div className="max-w-7xl mx-auto flex items-center overflow-x-auto scrollbar-none">
          <Link href={`/store/${tenant.slug}`} className="px-5 py-3.5 bg-[#2a2a2a]"><Home className="w-4 h-4" /></Link>
          <Link href={`/store/${tenant.slug}/catalog`} className="px-5 py-3.5 hover:bg-gray-800">PRODUCTS</Link>
          <Link href={`/store/${tenant.slug}/catalog?category=development-boards`} className="px-5 py-3.5 hover:bg-gray-800">DEV BOARDS</Link>
          <Link href={`/store/${tenant.slug}/catalog?category=sensors`} className="px-5 py-3.5 hover:bg-gray-800">SENSORS v</Link>
        </div>
      </nav>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-start gap-6 w-full">
        {/* Left Sidebar */}
        <aside className="w-64 shrink-0 border border-gray-300 bg-white rounded-t-sm shadow-xs hidden md:block self-start">
          <div className="bg-gray-100 border-b border-gray-300 px-4 py-3 font-black text-xs text-gray-900 uppercase flex items-center gap-2">
            <Layers className="w-4 h-4 text-gray-700" />
            <span>MENU CATEGORIES</span>
          </div>
          <div className="divide-y divide-gray-200 max-h-[850px] overflow-y-auto">
            {tenantCategories.map((cat) => {
              const isActive = resolvedSearch?.category === cat.slug;
              return (
                <Link
                  key={cat.id}
                  href={`/store/${tenant.slug}/catalog?category=${cat.slug}`}
                  className={`flex items-center justify-between px-4 py-2.5 text-xs font-bold border-l-4 ${
                    isActive ? 'border-[#82c91e] bg-emerald-50 text-emerald-800' : 'border-transparent text-gray-800 hover:border-[#82c91e] hover:bg-gray-50'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-gray-400">+</span>
                </Link>
              );
            })}
          </div>
        </aside>

        {/* Right Product Grid */}
        <main className="flex-1 min-w-0 space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[#82c91e] pb-2">
            <h1 className="text-sm font-black uppercase text-gray-900">
              {resolvedSearch?.category ? `Category: ${resolvedSearch.category.toUpperCase().replace(/-/g, ' ')}` : 'ALL PRODUCTS'}
            </h1>
            <span className="text-xs text-gray-500 font-bold">{enrichedProducts.length} items</span>
          </div>

          {enrichedProducts.length === 0 ? (
            <div className="py-12 text-center bg-white border border-gray-200 p-8 rounded">
              <p className="text-xs font-bold text-gray-500">No products found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {enrichedProducts.map((p) => {
                const priceFormatted = (p.minPriceInCents / 100).toFixed(2);
                const compareAt = p.variants?.[0]?.compareAtPriceInCents ? (p.variants[0].compareAtPriceInCents / 100).toFixed(2) : null;
                const imageUrl = p.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop';

                return (
                  <Link key={p.id} href={`/store/${tenant.slug}/product/${p.handle || p.id}`} className="group flex flex-col justify-between border border-gray-200 bg-white p-3 rounded hover:border-gray-400 transition-all font-sans relative">
                    <div className="relative aspect-square w-full overflow-hidden bg-gray-50 mb-2.5 flex items-center justify-center">
                      <img src={imageUrl} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      {compareAt && <span className="absolute top-1 right-1 bg-red-600 text-white font-black text-[10px] px-1.5 py-0.5 rounded">Reduced price</span>}
                    </div>
                    <div className="flex-1 flex flex-col justify-between space-y-1">
                      <h3 className="text-xs font-bold text-gray-800 line-clamp-2 group-hover:text-emerald-700">{p.title}</h3>
                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="text-sm font-black text-red-600">{currencySymbol}{priceFormatted}</span>
                        {compareAt && <span className="text-[11px] text-gray-400 line-through">{currencySymbol}{compareAt}</span>}
                      </div>
                    </div>
                    <div className="w-full mt-3 py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1.5 bg-[#82c91e] text-white">
                      <Eye className="w-3.5 h-3.5" />
                      <span>See more</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
