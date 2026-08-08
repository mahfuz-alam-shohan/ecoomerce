import React from 'react';
import Link from 'next/link';
import { resolveStorefront, getStoreCatalog } from '@/lib/storefront-client';
import { StoreHeader } from '@/components/layout/store-header';
import { StoreFooter } from '@/components/layout/store-footer';
import { CategorySidebar } from '@/components/layout/category-sidebar';
import { CheckCircle, Truck, CreditCard } from 'lucide-react';

export const revalidate = 0;

export default async function StorefrontCheckoutPage() {
  const store = await resolveStorefront();
  const products = await getStoreCatalog({ limit: 2 });

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
    console.error('Failed fetching checkout categories:', e);
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
            Home &gt; <span className="text-gray-900 font-bold">Checkout & Order Placement</span>
          </div>

          <h1 className="text-base sm:text-lg font-black uppercase text-gray-900 border-b-2 border-[#82c91e] pb-2">
            <span>CHECKOUT & ORDER PLACEMENT</span>
          </h1>

          <form action={`${apiUrl}/api/v1/storefront/checkout`} method="POST" className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <input type="hidden" name="tenantId" value={tenantId} />
            
            {/* Column 1 & 2: Address and Delivery Info */}
            <div className="md:col-span-2 space-y-6">
              <div className="border border-gray-300 rounded bg-white p-5 space-y-4">
                <h2 className="text-xs font-black uppercase text-gray-900 border-b border-gray-200 pb-2.5 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-gray-700" />
                  <span>1. Delivery Address & Customer Information</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-gray-700">
                  <div>
                    <label className="block mb-1">First name *</label>
                    <input type="text" name="firstName" required defaultValue="Mahfuz" className="w-full border border-gray-300 rounded px-3 py-2 font-normal focus:outline-none focus:border-sky-500" />
                  </div>
                  <div>
                    <label className="block mb-1">Last name *</label>
                    <input type="text" name="lastName" required defaultValue="Alam" className="w-full border border-gray-300 rounded px-3 py-2 font-normal focus:outline-none focus:border-sky-500" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block mb-1">Email address *</label>
                    <input type="email" name="email" required defaultValue="mahfuz@roboticsbd.com" className="w-full border border-gray-300 rounded px-3 py-2 font-normal focus:outline-none focus:border-sky-500" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block mb-1">Phone number / Mobile *</label>
                    <input type="tel" name="phone" required defaultValue="+8801711000000" className="w-full border border-gray-300 rounded px-3 py-2 font-normal focus:outline-none focus:border-sky-500" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block mb-1">Full Shipping Address *</label>
                    <textarea name="address" required rows={2} defaultValue="House 42, Road 11, Sector 4, Uttara, Dhaka-1230" className="w-full border border-gray-300 rounded px-3 py-2 font-normal focus:outline-none focus:border-sky-500" />
                  </div>
                </div>
              </div>

              <div className="border border-gray-300 rounded bg-white p-5 space-y-4">
                <h2 className="text-xs font-black uppercase text-gray-900 border-b border-gray-200 pb-2.5 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-700" />
                  <span>2. Payment Method</span>
                </h2>
                <div className="space-y-3 text-xs font-bold text-gray-800">
                  <label className="flex items-center gap-3 p-3 border border-[#82c91e] bg-emerald-50 rounded cursor-pointer">
                    <input type="radio" name="paymentMethod" value="COD" defaultChecked className="accent-[#82c91e]" />
                    <div className="flex flex-col">
                      <span className="font-extrabold text-emerald-900">Cash on Delivery (COD)</span>
                      <span className="text-[11px] font-normal text-emerald-700">Pay cash upon delivery at your doorstep across Bangladesh.</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-gray-300 hover:border-gray-400 bg-white rounded cursor-pointer">
                    <input type="radio" name="paymentMethod" value="BANK_TRANSFER" className="accent-[#82c91e]" />
                    <div className="flex flex-col">
                      <span className="font-extrabold text-gray-900">Bank Transfer / bKash / Nagad</span>
                      <span className="text-[11px] font-normal text-gray-500">Pay instantly via mobile financial services or direct bank deposit.</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Column 3: Order Review & Submit */}
            <div className="border border-gray-300 rounded bg-white p-5 space-y-4 sticky top-6">
              <h2 className="text-xs font-black uppercase text-gray-900 border-b border-gray-200 pb-2.5">3. Review & Placement</h2>
              
              <div className="divide-y divide-gray-200 max-h-48 overflow-y-auto pr-1">
                {sampleCartItems.map((p) => {
                  const price = (p.minPriceInCents / 100).toFixed(2);
                  return (
                    <div key={p.id} className="py-2 flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-800 truncate max-w-[150px]">{p.title}</span>
                      <span className="font-mono text-gray-600">1 x {currencySymbol}{price}</span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-200 pt-3 space-y-1.5 text-xs font-semibold text-gray-700">
                <div className="flex justify-between">
                  <span>Items total:</span>
                  <span className="font-bold text-gray-900">{currencySymbol}{totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping cost:</span>
                  <span className="font-bold text-emerald-700">Free</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 text-sm font-black text-gray-900">
                  <span>Amount payable:</span>
                  <span className="text-red-600">{currencySymbol}{totalAmount}</span>
                </div>
              </div>

              <button type="submit" className="w-full bg-[#82c91e] hover:bg-[#74b81b] text-white font-black text-xs px-5 py-3.5 rounded flex items-center justify-center gap-2 shadow-xs uppercase tracking-wider">
                <CheckCircle className="w-4 h-4" />
                <span>I confirm my order</span>
              </button>
              <p className="text-[10px] text-gray-500 text-center font-medium">
                By confirming your order, you agree to our terms of service and return policies.
              </p>
            </div>
          </form>
        </main>
      </div>

      {store ? <StoreFooter store={store} /> : null}
    </div>
  );
}
