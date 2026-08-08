import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { tenants, categories, products, variants } from '@/lib/db/schemas';
import { eq, and, sql, asc } from 'drizzle-orm';
import { Phone, Mail, Award, Package, ShieldCheck, Search, ShoppingCart, Home, Layers, Star, CheckCircle } from 'lucide-react';

export const revalidate = 0;

export default async function TenantStoreProductDetail({
  params,
}: {
  params: Promise<{ slug: string; handle: string }>;
}) {
  const resolvedParams = await params;
  const { slug: tenantSlug, handle } = resolvedParams;

  const [tenant] = await db.select().from(tenants).where(eq(tenants.slug, tenantSlug)).limit(1);
  if (!tenant) notFound();

  const tenantCategories = await db.select().from(categories).where(eq(categories.tenantId, tenant.id)).orderBy(asc(categories.name));

  const [product] = await db
    .select()
    .from(products)
    .where(and(eq(products.tenantId, tenant.id), sql`(${products.handle} = ${handle} OR ${products.id} = ${handle})`))
    .limit(1);

  if (!product) notFound();

  const pVariants = await db.select().from(variants).where(eq(variants.productId, product.id));
  const minPriceInCents = pVariants.length > 0 ? Math.min(...pVariants.map((v) => v.priceInCents)) : 0;
  const compareAtInCents = pVariants.length > 0 ? pVariants[0].compareAtPriceInCents : null;

  const priceFormatted = (minPriceInCents / 100).toFixed(2);
  const compareAtFormatted = compareAtInCents ? (compareAtInCents / 100).toFixed(2) : null;
  const imageUrl = product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop';
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
          <input type="text" name="search" placeholder="Search catalog..." className="flex-1 px-4 py-2 text-sm focus:outline-none" />
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

      {/* Main Body */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-start gap-6 w-full">
        {/* Left Sidebar */}
        <aside className="w-64 shrink-0 border border-gray-300 bg-white rounded-t-sm shadow-xs hidden md:block self-start">
          <div className="bg-gray-100 border-b border-gray-300 px-4 py-3 font-black text-xs text-gray-900 uppercase flex items-center gap-2">
            <Layers className="w-4 h-4 text-gray-700" />
            <span>MENU CATEGORIES</span>
          </div>
          <div className="divide-y divide-gray-200 max-h-[850px] overflow-y-auto">
            {tenantCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/store/${tenant.slug}/catalog?category=${cat.slug}`}
                className="flex items-center justify-between px-4 py-2.5 text-xs font-bold text-gray-800 hover:text-emerald-700 hover:bg-gray-50 border-l-4 border-transparent hover:border-[#82c91e]"
              >
                <span>{cat.name}</span>
                <span className="text-gray-400">+</span>
              </Link>
            ))}
          </div>
        </aside>

        {/* Right Single Product Detail */}
        <main className="flex-1 min-w-0 space-y-4">
          <div className="text-xs text-gray-500 font-medium">
            Home &gt; Hardware Products &gt; <span className="text-gray-900 font-bold">{product.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Col 1: Image */}
            <div className="space-y-3">
              <div className="relative aspect-square w-full overflow-hidden border border-gray-300 rounded bg-white p-4 flex items-center justify-center">
                <img src={imageUrl} alt={product.title} className="w-full h-full object-contain object-center" />
                {compareAtFormatted && (
                  <div className="absolute top-3 right-3 bg-red-600 text-white font-extrabold text-xs uppercase px-2.5 py-1 rounded">
                    Reduced price
                  </div>
                )}
              </div>
              {product.images && product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {product.images.map((img, i) => (
                    <div key={i} className="h-16 w-16 border rounded p-1 bg-white">
                      <img src={img} alt="thumb" className="h-full w-full object-contain" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Col 2: Info & Purchase */}
            <div className="flex flex-col space-y-4">
              <div className="space-y-2 border-b border-gray-200 pb-4">
                <h1 className="text-lg sm:text-2xl font-black text-gray-900">{product.title}</h1>
                <div className="flex items-center gap-4 text-xs font-semibold text-gray-600">
                  <span>Reference: <span className="text-gray-900 font-mono font-bold">{pVariants[0]?.sku || 'RBD-3255'}</span></span>
                  <span>Brand: <span className="text-gray-900 font-bold uppercase">{product.title.split(' ')[0] || 'ROBOTICS'}</span></span>
                </div>
              </div>

              <div className="text-xs sm:text-sm text-gray-700 space-y-1.5 whitespace-pre-line border-b border-gray-200 pb-4">
                {product.description || 'Verified industrial grade hardware component.'}
              </div>

              <div className="space-y-3 border-b border-gray-200 pb-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-black text-red-600">{currencySymbol}{priceFormatted}</span>
                  {compareAtFormatted && <span className="text-base text-gray-400 line-through font-bold">{currencySymbol}{compareAtFormatted}</span>}
                  {compareAtFormatted && <span className="bg-red-600 text-white text-xs font-black px-2 py-0.5 rounded">Save {currencySymbol}{((Number(compareAtFormatted) - Number(priceFormatted))).toFixed(0)}</span>}
                </div>

                {compareAtFormatted && (
                  <div className="bg-orange-50 border border-orange-200 rounded p-2.5 flex items-center justify-between text-xs">
                    <span className="font-extrabold text-orange-900 italic">Discount Ends In:</span>
                    <div className="flex items-center gap-1 font-mono font-black text-white">
                      <span className="bg-slate-900 px-1.5 py-1 rounded">00</span><span className="text-slate-900">:</span>
                      <span className="bg-slate-900 px-1.5 py-1 rounded">02</span><span className="text-slate-900">:</span>
                      <span className="bg-slate-900 px-1.5 py-1 rounded">13</span><span className="text-slate-900">:</span>
                      <span className="bg-slate-900 px-1.5 py-1 rounded">12</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs">
                  <div className="flex text-amber-500">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}</div>
                  <span className="font-bold text-gray-800">Read the review</span><span className="text-gray-400">|</span><span className="text-gray-600">Average rating: 5/5</span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-4">
                <span className="text-xs font-bold text-gray-800">Quantity</span>
                <div className="flex items-center border border-gray-300 rounded bg-white overflow-hidden w-24">
                  <input type="text" readOnly value="1" className="w-12 text-center font-bold text-sm py-1.5 focus:outline-none" />
                  <div className="flex flex-col w-12 bg-gray-50 text-xs font-bold border-l">
                    <span className="h-4 flex items-center justify-center border-b">▲</span>
                    <span className="h-4 flex items-center justify-center">▼</span>
                  </div>
                </div>
                <button className="flex-1 bg-[#82c91e] hover:bg-[#74b81b] text-white font-black text-sm px-6 py-3 rounded flex items-center justify-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to cart</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
