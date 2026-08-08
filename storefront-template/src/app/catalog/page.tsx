import React from 'react';
import { resolveStorefront, getStoreCatalog } from '@/lib/storefront-client';
import { StoreHeader } from '@/components/layout/store-header';
import { StoreFooter } from '@/components/layout/store-footer';
import { CategorySidebar } from '@/components/layout/category-sidebar';
import { ProductCard } from '@/components/catalog/product-card';
import { SlidersHorizontal, Search } from 'lucide-react';

export const revalidate = 0;

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; sort?: string; category?: string; minPrice?: string; maxPrice?: string }>;
}) {
  const resolvedParams = await searchParams;
  const store = await resolveStorefront();

  const products = await getStoreCatalog({
    search: resolvedParams?.search,
    sort: resolvedParams?.sort,
    category: resolvedParams?.category,
    minPrice: resolvedParams?.minPrice ? Number(resolvedParams.minPrice) : undefined,
    maxPrice: resolvedParams?.maxPrice ? Number(resolvedParams.maxPrice) : undefined,
  });

  const apiUrl = process.env.NEXT_PUBLIC_STORE_API_URL || 'http://localhost:3000';
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
    console.error('Failed fetching categories:', e);
  }

  const { storeConfig } = store || { storeConfig: { currency: 'BDT' } };
  const currencySymbol = storeConfig.currency === 'USD' ? '$' : storeConfig.currency === 'EUR' ? '€' : 'BDT ';

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfc] text-gray-900 font-sans">
      {store ? <StoreHeader store={store} /> : null}

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-start gap-6 w-full">
        {/* Left Category Sidebar */}
        <CategorySidebar categories={categories} activeCategoryId={resolvedParams?.category} />

        {/* Right Main Catalog Content */}
        <main className="flex-1 min-w-0 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#82c91e] pb-2">
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-gray-900 uppercase">
                {resolvedParams?.search
                  ? `Search Results: "${resolvedParams.search}"`
                  : resolvedParams?.category
                  ? `Category: ${resolvedParams.category.toUpperCase().replace(/-/g, ' ')}`
                  : 'ALL HARDWARE PRODUCTS'}
              </h1>
              <p className="text-xs text-gray-500 font-medium">
                Showing {products.length} {products.length === 1 ? 'product' : 'products'} in stock for express delivery.
              </p>
            </div>

            <form method="GET" action="/catalog" className="flex items-center gap-2">
              {resolvedParams?.search && <input type="hidden" name="search" value={resolvedParams.search} />}
              {resolvedParams?.category && <input type="hidden" name="category" value={resolvedParams.category} />}

              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded border border-gray-300 text-xs font-bold">
                <SlidersHorizontal className="w-3.5 h-3.5 text-gray-500" />
                <select
                  name="sort"
                  defaultValue={resolvedParams?.sort || 'newest'}
                  className="bg-transparent border-none font-bold text-gray-800 focus:outline-none cursor-pointer"
                >
                  <option value="newest">Sort by: Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>

              <button type="submit" className="px-3.5 py-1.5 rounded bg-[#82c91e] hover:bg-[#74b81b] text-white text-xs font-bold shadow-2xs">
                Filter
              </button>
            </form>
          </div>

          {products.length === 0 ? (
            <div className="py-16 text-center bg-white rounded border border-gray-200 p-8 space-y-3">
              <Search className="w-10 h-10 text-gray-400 mx-auto" />
              <h3 className="text-sm font-bold text-gray-800">No products match your criteria</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Try selecting a different category from the left menu or clearing your search term.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} currencySymbol={currencySymbol} />
              ))}
            </div>
          )}
        </main>
      </div>

      {store ? <StoreFooter store={store} /> : null}
    </div>
  );
}
