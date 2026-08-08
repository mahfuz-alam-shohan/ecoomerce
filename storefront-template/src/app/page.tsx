import React from 'react';
import Link from 'next/link';
import { resolveStorefront, getStoreCatalog } from '@/lib/storefront-client';
import { StoreHeader } from '@/components/layout/store-header';
import { StoreFooter } from '@/components/layout/store-footer';
import { CategorySidebar } from '@/components/layout/category-sidebar';
import { ProductCard } from '@/components/catalog/product-card';
import { ChevronRight, Cpu, HardDrive, Wifi, Radio, Wrench, BatteryCharging, Layers, Printer } from 'lucide-react';

export const revalidate = 10;

export default async function StorefrontHomePage() {
  const store = await resolveStorefront();
  const products = await getStoreCatalog({});

  // Get categories or fallback if API hasn't enriched yet
  const apiUrl = process.env.NEXT_PUBLIC_STORE_API_URL || 'http://localhost:3000';
  const apiKey = process.env.NEXT_PUBLIC_STOREFRONT_TOKEN || 'sf_pub_shenzen_123';
  const tenantId = store?.tenantId || 'f2a2c52b-e6e0-4538-8d1c-2c0176872657';

  let categories = [];
  try {
    const catRes = await fetch(`${apiUrl}/api/v1/storefront/catalog?tenantId=${tenantId}&limit=50`, {
      next: { revalidate: 10 },
    });
    if (catRes.ok) {
      const catJson = await catRes.json();
      categories = catJson?.data?.categories || [];
    }
  } catch (e) {
    console.error('Failed fetching sidebar categories:', e);
  }

  const { storeConfig } = store || { storeConfig: { currency: 'BDT' } };
  const currencySymbol = storeConfig.currency === 'USD' ? '$' : storeConfig.currency === 'EUR' ? '€' : 'BDT ';

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfc] text-gray-900 font-sans">
      {store ? <StoreHeader store={store} /> : null}

      {/* Main Container with Left Category Sidebar & Right Main Content */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-start gap-6 w-full">
        {/* Left Category Tree (RoboticsBD MENU CATEGORIES sidebar) */}
        <CategorySidebar categories={categories} />

        {/* Right Main Area */}
        <main className="flex-1 min-w-0 space-y-8">
          {/* 1. Hero Banner Box (Exact RoboticsBD Creality Falcon2 / NVIDIA Jetson Banner) */}
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
                  href="/catalog?search=Falcon2"
                  className="bg-[#82c91e] hover:bg-[#74b81b] text-white font-extrabold px-6 py-3 rounded shadow-md text-sm transition-transform hover:scale-105"
                >
                  Explore Falcon2 →
                </Link>
                <Link
                  href="/catalog?category=development-boards"
                  className="bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-3 rounded text-sm transition-colors border border-white/20"
                >
                  View Dev Boards
                </Link>
              </div>
            </div>

            <div className="relative w-full sm:w-80 aspect-4/3 shrink-0 rounded-lg overflow-hidden border-2 border-slate-700 shadow-xl bg-slate-800">
              <img
                src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop"
                alt="Creality Falcon2 40W"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 bg-red-600 text-white text-[11px] font-black uppercase px-2 py-0.5 rounded">
                Save BDT 1,000
              </div>
            </div>
          </div>

          {/* 2. FEATURED CATEGORIES Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#82c91e] pb-1.5">
              <h2 className="text-sm font-black uppercase text-gray-900 tracking-wider">FEATURED CATEGORIES</h2>
              <Link href="/catalog" className="text-xs font-bold text-[#82c91e] hover:underline flex items-center">
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
                { name: 'SENSORS', icon: Layers, slug: 'sensors' },
                { name: 'ROBOTICS PARTS', icon: Cpu, slug: 'robotics-parts' },
                { name: 'INSTRUMENTS', icon: Radio, slug: 'instruments' },
                { name: 'TOOLS & ACCESSORIES', icon: Wrench, slug: 'tools-accessories' },
                { name: 'BATTERY & CHARGER', icon: BatteryCharging, slug: 'battery-charger' },
              ].map((c, idx) => {
                const Icon = c.icon;
                return (
                  <Link
                    key={idx}
                    href={`/catalog?category=${c.slug}`}
                    className="border border-gray-200 bg-white p-3.5 rounded flex flex-col items-center justify-between text-center hover:border-emerald-600 hover:shadow-xs transition-all group min-h-[140px]"
                  >
                    <div className="h-12 w-12 rounded-full bg-emerald-50/80 text-[#82c91e] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-extrabold uppercase text-gray-800 tracking-tight leading-snug line-clamp-2 my-1.5 group-hover:text-emerald-700">
                      {c.name}
                    </span>
                    <span className="bg-[#82c91e] group-hover:bg-[#74b81b] text-white text-[11px] font-bold px-3 py-1 rounded w-full shadow-2xs">
                      See more
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* 3. POPULAR PRODUCTS Section */}
          <section className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b-2 border-[#82c91e] pb-1.5">
              <h2 className="text-sm font-black uppercase text-gray-900 tracking-wider">POPULAR PRODUCTS</h2>
              <Link href="/catalog" className="text-xs font-bold text-[#82c91e] hover:underline flex items-center">
                <span>See all products ({products.length})</span>
                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>

            {products.length === 0 ? (
              <div className="py-12 text-center bg-white border border-gray-200 rounded p-6">
                <p className="text-xs font-bold text-gray-500">No products found in catalog. Run seed script or add products in dashboard.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} currencySymbol={currencySymbol} />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>

      {store ? <StoreFooter store={store} /> : null}
    </div>
  );
}
