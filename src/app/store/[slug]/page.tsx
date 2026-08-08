import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { tenants, categories, products, variants } from '@/lib/db/schemas';
import { eq, and, sql, asc } from 'drizzle-orm';
import { Phone, Mail, Award, Package, ShieldCheck, Search, ShoppingCart, Home, ChevronRight, Cpu, HardDrive, Wifi, Radio, Wrench, BatteryCharging, Layers, Printer, Eye } from 'lucide-react';

export const revalidate = 0;

export default async function TenantPublicStoreHome({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const tenantSlug = resolvedParams.slug;

  // 1. Fetch tenant from database
  const [tenant] = await db
    .select()
    .from(tenants)
    .where(eq(tenants.slug, tenantSlug))
    .limit(1);

  if (!tenant) {
    notFound();
  }

  // 2. Fetch all categories for this tenant
  const tenantCategories = await db
    .select()
    .from(categories)
    .where(eq(categories.tenantId, tenant.id))
    .orderBy(asc(categories.name));

  // 3. Fetch active/published products with variants
  const tenantProducts = await db
    .select()
    .from(products)
    .where(and(eq(products.tenantId, tenant.id), sql`(${products.status} = 'published' OR ${products.status} = 'active')`))
    .limit(36);

  const productIds = tenantProducts.map((p) => p.id);
  let allVariants: typeof variants.$inferSelect[] = [];
  if (productIds.length > 0) {
    allVariants = await db.select().from(variants).where(sql`${variants.productId} IN (${sql.join(productIds, sql`, `)})`);
  }

  const enrichedProducts = tenantProducts.map((p) => {
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
      {/* 1. Top Contact Strip (RoboticsBD style) */}
      <div className="w-full bg-[#f8f9fa] border-b border-gray-200 py-1.5 px-4 text-[11px] text-gray-700 hidden lg:flex items-center justify-between">
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-1 font-semibold text-gray-800">
            <Phone className="w-3 h-3 text-[#82c91e]" /> Phone: 01792 007 004
          </span>
          <span className="flex items-center gap-1 font-semibold text-gray-800">
            <Mail className="w-3 h-3 text-[#82c91e]" /> Email: ask@{tenant.slug}.com
          </span>
          <span className="flex items-center gap-1 text-gray-600">
            <Award className="w-3 h-3 text-gray-500" /> Over 12 years of experience
          </span>
          <span className="flex items-center gap-1 text-gray-600">
            <Package className="w-3 h-3 text-gray-500" /> Over 4000 hardware parts
          </span>
          <span className="flex items-center gap-1 text-gray-600">
            <ShieldCheck className="w-3 h-3 text-gray-500" /> Over 80,000 shipped orders
          </span>
        </div>

        <div className="text-gray-700">
          Welcome, <span className="text-emerald-700 font-bold cursor-pointer hover:underline">Sign in</span> or <span className="text-emerald-700 font-bold cursor-pointer hover:underline">Create an account</span>
        </div>
      </div>

      {/* 2. Main Brand & Search Bar Section */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4 sm:gap-8 w-full">
        <Link href={`/store/${tenant.slug}`} className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="text-2xl sm:text-3xl font-black text-[#1e3a8a] tracking-tighter uppercase">
              {tenant.name.split(' ')[0] || 'ROBOTICS'}
            </span>
            <span className="text-2xl sm:text-3xl font-black text-[#f97316] tracking-tighter uppercase">
              {tenant.name.split(' ').slice(1).join(' ') || 'BD'}
            </span>
          </div>
          <span className="text-[10px] sm:text-xs font-bold text-sky-600 tracking-widest uppercase">
            DISCOVER YOURSELF
          </span>
        </Link>

        {/* Search Input */}
        <form
          action={`/store/${tenant.slug}/catalog`}
          method="GET"
          className="hidden sm:flex flex-1 max-w-xl items-center border-2 border-gray-300 rounded overflow-hidden bg-white focus-within:border-sky-500 transition-colors"
        >
          <input
            type="text"
            name="search"
            placeholder="Search our catalog (e.g. Arduino, Jetson, Raspberry Pi, Sensor)..."
            className="flex-1 px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
          />
          <button
            type="submit"
            className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-2.5 flex items-center justify-center transition-colors shrink-0"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>

        {/* Right Cart Button */}
        <Link
          href={`/store/${tenant.slug}/cart`}
          className="flex items-center gap-2.5 bg-[#82c91e] hover:bg-[#74b81b] text-white font-extrabold px-4 sm:px-5 py-2.5 rounded shadow-sm text-xs sm:text-sm transition-colors shrink-0"
        >
          <ShoppingCart className="w-4 h-4 shrink-0" />
          <span>Cart: 0 Products – {currencySymbol}0.00</span>
        </Link>
      </header>

      {/* 3. Dark Navigation Strip */}
      <nav className="w-full bg-[#1c1c1c] text-white text-xs font-bold tracking-wider uppercase border-t border-gray-800">
        <div className="max-w-7xl mx-auto flex items-center overflow-x-auto scrollbar-none">
          <Link
            href={`/store/${tenant.slug}`}
            className="px-5 py-3.5 bg-[#2a2a2a] hover:bg-[#333] flex items-center justify-center border-r border-gray-800 transition-colors shrink-0"
          >
            <Home className="w-4 h-4 text-white" />
          </Link>
          <Link href={`/store/${tenant.slug}/catalog`} className="px-5 py-3.5 hover:bg-gray-800 border-r border-gray-800 whitespace-nowrap">
            PRODUCTS
          </Link>
          <Link href={`/store/${tenant.slug}/catalog?category=development-boards`} className="px-5 py-3.5 hover:bg-gray-800 border-r border-gray-800 whitespace-nowrap">
            DEV BOARDS
          </Link>
          <Link href={`/store/${tenant.slug}/catalog?category=sensors`} className="px-5 py-3.5 hover:bg-gray-800 border-r border-gray-800 whitespace-nowrap">
            SENSORS v
          </Link>
          <Link href={`/store/${tenant.slug}/catalog?category=electronics-module`} className="px-5 py-3.5 hover:bg-gray-800 border-r border-gray-800 whitespace-nowrap">
            ELECTRONICS MODULE v
          </Link>
          <Link href={`/store/${tenant.slug}/catalog`} className="px-5 py-3.5 hover:bg-gray-800 border-r border-gray-800 whitespace-nowrap">
            BACK IN STOCK
          </Link>
          <Link href={`/store/${tenant.slug}/catalog`} className="px-5 py-3.5 hover:bg-gray-800 border-r border-gray-800 text-orange-400 whitespace-nowrap">
            NEW DISCOUNT
          </Link>
          <Link href={`/store/${tenant.slug}/catalog`} className="px-5 py-3.5 hover:bg-gray-800 whitespace-nowrap">
            CONTACT
          </Link>
        </div>
      </nav>

      {/* 4. Main Body: Sidebar + Hero + Featured Grid + Popular Products Grid */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-start gap-6 w-full">
        {/* Left MENU CATEGORIES Sidebar */}
        <aside className="w-64 shrink-0 border border-gray-300 bg-white rounded-t-sm shadow-xs hidden md:block self-start">
          <div className="bg-gray-100 border-b border-gray-300 px-4 py-3 font-black text-xs text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-gray-700" />
            <span>MENU CATEGORIES</span>
          </div>
          <div className="divide-y divide-gray-200 max-h-[850px] overflow-y-auto">
            {tenantCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/store/${tenant.slug}/catalog?category=${cat.slug}`}
                className="flex items-center justify-between px-4 py-2.5 text-xs font-bold text-gray-800 hover:text-emerald-700 hover:bg-gray-50 border-l-4 border-transparent hover:border-[#82c91e] transition-all"
              >
                <span className="truncate pr-2">{cat.name}</span>
                <span className="text-gray-400 text-sm font-mono">+</span>
              </Link>
            ))}
          </div>
        </aside>

        {/* Right Area */}
        <main className="flex-1 min-w-0 space-y-8">
          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-10 shadow-md border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-8 min-h-[320px]">
            <div className="space-y-4 max-w-lg z-10">
              <span className="inline-block px-3 py-1 rounded bg-[#82c91e] text-white font-black text-xs uppercase tracking-wider">
                FEATURED HARDWARE
              </span>
              <h1 className="text-2xl sm:text-4xl font-black leading-tight tracking-tight">
                Creality Falcon2 40W
                <span className="block text-[#82c91e]">Mighty but Precise</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-300 font-medium">
                Pro-tech for Pro-work. 40W Strong Laser Power with adjustable light beam up to 25,000mm/min precision speed.
              </p>
              <div className="pt-2 flex items-center gap-4">
                <Link
                  href={`/store/${tenant.slug}/catalog?search=Falcon2`}
                  className="bg-[#82c91e] hover:bg-[#74b81b] text-white font-extrabold px-6 py-3 rounded shadow-md text-sm transition-transform hover:scale-105"
                >
                  Explore Falcon2 →
                </Link>
              </div>
            </div>
            <div className="relative w-full sm:w-80 aspect-4/3 shrink-0 rounded-lg overflow-hidden border-2 border-slate-700 shadow-xl bg-slate-800">
              <img
                src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop"
                alt="Falcon2"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 bg-red-600 text-white text-[11px] font-black uppercase px-2 py-0.5 rounded">
                Save BDT 1,000
              </div>
            </div>
          </div>

          {/* FEATURED CATEGORIES Grid */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#82c91e] pb-1.5">
              <h2 className="text-sm font-black uppercase text-gray-900 tracking-wider">FEATURED CATEGORIES</h2>
              <Link href={`/store/${tenant.slug}/catalog`} className="text-xs font-bold text-[#82c91e] hover:underline flex items-center">
                <span>View All Categories</span>
                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {[
                { name: 'DEVELOPMENT BOARDS', icon: Cpu, slug: 'development-boards' },
                { name: 'RASPBERRY PI', icon: HardDrive, slug: 'raspberry-pi' },
                { name: '3D PRINTER', icon: Printer, slug: '3d-printer' },
                { name: 'INTERNET OF THINGS', icon: Wifi, slug: 'internet-of-things-iot' },
                { name: 'HOME AUTOMATION', icon: Radio, slug: 'home-automation' },
              ].map((c, idx) => {
                const Icon = c.icon;
                return (
                  <Link
                    key={idx}
                    href={`/store/${tenant.slug}/catalog?category=${c.slug}`}
                    className="border border-gray-200 bg-white p-3.5 rounded flex flex-col items-center justify-between text-center hover:border-emerald-600 transition-all group min-h-[140px]"
                  >
                    <div className="h-12 w-12 rounded-full bg-emerald-50/80 text-[#82c91e] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-extrabold uppercase text-gray-800 tracking-tight leading-snug line-clamp-2 my-1.5">
                      {c.name}
                    </span>
                    <span className="bg-[#82c91e] group-hover:bg-[#74b81b] text-white text-[11px] font-bold px-3 py-1 rounded w-full">
                      See more
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* POPULAR PRODUCTS Grid */}
          <section className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b-2 border-[#82c91e] pb-1.5">
              <h2 className="text-sm font-black uppercase text-gray-900 tracking-wider">POPULAR PRODUCTS</h2>
              <Link href={`/store/${tenant.slug}/catalog`} className="text-xs font-bold text-[#82c91e] hover:underline flex items-center">
                <span>See all products ({enrichedProducts.length})</span>
                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {enrichedProducts.map((p) => {
                const priceFormatted = (p.minPriceInCents / 100).toFixed(2);
                const compareAt = p.variants?.[0]?.compareAtPriceInCents
                  ? (p.variants[0].compareAtPriceInCents / 100).toFixed(2)
                  : null;
                const imageUrl = p.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop';

                return (
                  <Link
                    key={p.id}
                    href={`/store/${tenant.slug}/product/${p.handle || p.id}`}
                    className="group flex flex-col justify-between border border-gray-200 bg-white p-3 rounded hover:border-gray-400 transition-all font-sans relative"
                  >
                    <div className="relative aspect-square w-full overflow-hidden bg-gray-50 rounded-xs mb-2.5 flex items-center justify-center">
                      <img src={imageUrl} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      {compareAt && (
                        <span className="absolute top-1.5 right-1.5 bg-red-600 text-white font-extrabold text-[10px] uppercase px-1.5 py-0.5 rounded">
                          Reduced price
                        </span>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between space-y-1">
                      <h3 className="text-xs font-bold text-gray-800 line-clamp-2 min-h-[32px] group-hover:text-emerald-700">
                        {p.title}
                      </h3>
                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="text-sm font-black text-red-600">
                          {currencySymbol}{priceFormatted}
                        </span>
                        {compareAt && (
                          <span className="text-[11px] text-gray-400 line-through font-medium">
                            {currencySymbol}{compareAt}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="w-full mt-3 py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1.5 bg-[#82c91e] group-hover:bg-[#74b81b] text-white">
                      <Eye className="w-3.5 h-3.5" />
                      <span>See more</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
