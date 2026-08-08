import React from 'react';
import Link from 'next/link';
import { resolveStorefront } from '@/lib/storefront-client';
import { StoreHeader } from '@/components/layout/store-header';
import { StoreFooter } from '@/components/layout/store-footer';
import { CategorySidebar } from '@/components/layout/category-sidebar';
import { UserPlus } from 'lucide-react';

export const revalidate = 0;

export default async function StorefrontRegisterPage() {
  const store = await resolveStorefront();

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
    console.error('Failed fetching register categories:', e);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfc] text-gray-900 font-sans select-none">
      {store ? <StoreHeader store={store} /> : null}

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-start gap-6 w-full">
        <CategorySidebar categories={categories} />

        <main className="flex-1 min-w-0 space-y-6">
          <div className="text-xs text-gray-500 font-medium">
            Home &gt; <span className="text-gray-900 font-bold">Create an account</span>
          </div>

          <div className="border border-gray-300 rounded bg-white p-6 space-y-6 max-w-2xl">
            <h1 className="text-base sm:text-lg font-black uppercase text-gray-900 border-b-2 border-[#82c91e] pb-2">
              <span>CREATE AN ACCOUNT</span>
            </h1>

            <form className="space-y-4 text-xs font-bold text-gray-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">First name *</label>
                  <input type="text" placeholder="John" required className="w-full border border-gray-300 rounded px-3 py-2 font-normal text-sm focus:outline-none focus:border-sky-500" />
                </div>
                <div>
                  <label className="block mb-1">Last name *</label>
                  <input type="text" placeholder="Doe" required className="w-full border border-gray-300 rounded px-3 py-2 font-normal text-sm focus:outline-none focus:border-sky-500" />
                </div>
              </div>

              <div>
                <label className="block mb-1">Email address *</label>
                <input type="email" placeholder="customer@example.com" required className="w-full border border-gray-300 rounded px-3 py-2 font-normal text-sm focus:outline-none focus:border-sky-500" />
              </div>

              <div>
                <label className="block mb-1">Password *</label>
                <input type="password" placeholder="At least 8 characters" required className="w-full border border-gray-300 rounded px-3 py-2 font-normal text-sm focus:outline-none focus:border-sky-500" />
              </div>

              <div>
                <label className="block mb-1">Phone Number *</label>
                <input type="tel" placeholder="+8801700000000" required className="w-full border border-gray-300 rounded px-3 py-2 font-normal text-sm focus:outline-none focus:border-sky-500" />
              </div>

              <div className="pt-2">
                <button type="button" className="inline-flex items-center gap-2 bg-[#82c91e] hover:bg-[#74b81b] text-white font-black text-xs px-6 py-3 rounded shadow-xs uppercase tracking-wider">
                  <UserPlus className="w-4 h-4" />
                  <span>Register Account</span>
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>

      {store ? <StoreFooter store={store} /> : null}
    </div>
  );
}
