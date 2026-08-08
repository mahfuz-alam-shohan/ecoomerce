import React from 'react';
import { notFound } from 'next/navigation';
import { resolveStorefront, getStoreCatalog } from '@/lib/storefront-client';
import { StoreHeader } from '@/components/layout/store-header';
import { StoreFooter } from '@/components/layout/store-footer';
import { CategorySidebar } from '@/components/layout/category-sidebar';
import { ProductDetailView } from '@/components/catalog/product-detail-view';

export const revalidate = 0;

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const resolvedParams = await params;
  const store = await resolveStorefront();
  const products = await getStoreCatalog({});

  const product = products.find((p) => p.handle === resolvedParams.handle || p.id === resolvedParams.handle);
  if (!product) {
    notFound();
  }

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
        <CategorySidebar categories={categories} activeCategoryId={product.categoryId || undefined} />

        {/* Right Product Detail View */}
        <main className="flex-1 min-w-0 space-y-4">
          <div className="text-xs text-gray-500 font-medium">
            Home &gt; Hardware Products &gt; <span className="text-gray-900 font-bold">{product.title}</span>
          </div>

          <ProductDetailView product={product} currencySymbol={currencySymbol} />
        </main>
      </div>

      {store ? <StoreFooter store={store} /> : null}
    </div>
  );
}
