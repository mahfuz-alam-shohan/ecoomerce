import React from 'react';
import Link from 'next/link';
import { resolveStorefront, getStoreCatalog } from '@/lib/storefront-client';
import { StoreHeader } from '@/components/layout/store-header';
import { StoreFooter } from '@/components/layout/store-footer';
import { CategorySidebar } from '@/components/layout/category-sidebar';
import { ShoppingCart, Trash2, ArrowRight } from 'lucide-react';

export const revalidate = 0;

export default async function StorefrontCartPage() {
  const store = await resolveStorefront();
  const products = await getStoreCatalog({ limit: 4 });

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
    console.error('Failed fetching cart categories:', e);
  }

  const sampleCartItems = products.slice(0, 2);
  const currencySymbol = store?.storeConfig?.currency === 'USD' ? '$' : 'BDT ';
  const totalAmount = sampleCartItems.reduce((sum, p) => sum + (p.minPriceInCents / 100), 0).toFixed(2);

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfc] text-gray-900 font-sans select-none">
      {store ? <StoreHeader store={store} /> : null}

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-start gap-6 w-full">
        <CategorySidebar categories={categories} />

        <main className="flex-1 min-w-0 space-y-6">
          <div className="text-xs text-gray-500 font-medium">
            Home &gt; <span className="text-gray-900 font-bold">Shopping-cart summary</span>
          </div>

          <h1 className="text-base sm:text-lg font-black uppercase text-gray-900 border-b-2 border-[#82c91e] pb-2 flex items-center justify-between">
            <span>SHOPPING-CART SUMMARY</span>
            <span className="text-xs font-bold text-gray-500">Your cart contains : {sampleCartItems.length} Products</span>
          </h1>

          {sampleCartItems.length === 0 ? (
            <div className="py-12 text-center bg-white border border-gray-200 p-8 rounded">
              <p className="text-xs font-bold text-gray-500">Your shopping cart is empty.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Items Table */}
              <div className="lg:col-span-2 border border-gray-300 rounded bg-white overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-300 text-[11px] font-black uppercase text-gray-700">
                      <th className="p-3">Product</th>
                      <th className="p-3">Description</th>
                      <th className="p-3">Unit price</th>
                      <th className="p-3">Qty</th>
                      <th className="p-3 text-right">Total</th>
                      <th className="p-3 text-center">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-xs font-medium">
                    {sampleCartItems.map((p, idx) => {
                      const price = (p.minPriceInCents / 100).toFixed(2);
                      const imageUrl = p.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop';
                      return (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="p-3 w-16">
                            <img src={imageUrl} alt={p.title} className="w-12 h-12 object-contain border rounded p-1 bg-white" />
                          </td>
                          <td className="p-3 font-bold text-gray-800">
                            <Link href={`/product/${p.handle || p.id}`} className="hover:text-emerald-700">{p.title}</Link>
                            <div className="text-[10px] text-gray-500 font-mono mt-0.5">SKU: RBD-10{idx}</div>
                          </td>
                          <td className="p-3 font-bold">{currencySymbol}{price}</td>
                          <td className="p-3">
                            <div className="flex items-center border border-gray-300 rounded bg-white w-16">
                              <input type="text" readOnly value="1" className="w-8 text-center font-bold text-xs py-1 focus:outline-none" />
                              <div className="flex flex-col w-8 bg-gray-50 text-[10px] font-bold border-l">
                                <span className="h-3.5 flex items-center justify-center border-b cursor-pointer hover:bg-gray-200">▲</span>
                                <span className="h-3.5 flex items-center justify-center cursor-pointer hover:bg-gray-200">▼</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-right font-black text-red-600">{currencySymbol}{price}</td>
                          <td className="p-3 text-center">
                            <button className="text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4 mx-auto" /></button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Summary / Checkout Box */}
              <div className="border border-gray-300 rounded bg-white p-5 space-y-4">
                <h2 className="text-xs font-black uppercase text-gray-900 border-b border-gray-200 pb-2.5">Summary</h2>
                <div className="space-y-2 text-xs font-semibold text-gray-700">
                  <div className="flex justify-between">
                    <span>Total products:</span>
                    <span className="font-bold text-gray-900">{currencySymbol}{totalAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total shipping:</span>
                    <span className="font-bold text-emerald-700">Free</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-2 text-sm font-black text-gray-900">
                    <span>Total:</span>
                    <span className="text-red-600">{currencySymbol}{totalAmount}</span>
                  </div>
                </div>

                <Link href="/checkout" className="w-full bg-[#82c91e] hover:bg-[#74b81b] text-white font-black text-xs px-5 py-3 rounded flex items-center justify-center gap-2 shadow-xs uppercase tracking-wider">
                  <span>Proceed to checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>

      {store ? <StoreFooter store={store} /> : null}
    </div>
  );
}
