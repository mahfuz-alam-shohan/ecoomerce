import React from 'react';
import Link from 'next/link';
import { resolveStorefront } from '@/lib/storefront-client';
import { StoreHeader } from '@/components/layout/store-header';
import { StoreFooter } from '@/components/layout/store-footer';
import { CategorySidebar } from '@/components/layout/category-sidebar';
import { Lock, UserPlus } from 'lucide-react';

export const revalidate = 0;

export default async function StorefrontLoginPage() {
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
    console.error('Failed fetching login categories:', e);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfc] text-gray-900 font-sans select-none">
      {store ? <StoreHeader store={store} /> : null}

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-start gap-6 w-full">
        <CategorySidebar categories={categories} />

        <main className="flex-1 min-w-0 space-y-6">
          <div className="text-xs text-gray-500 font-medium">
            Home &gt; <span className="text-gray-900 font-bold">Authentication</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Create Account Box */}
            <div className="border border-gray-300 rounded bg-white p-6 space-y-4">
              <h2 className="text-sm font-black uppercase text-gray-900 border-b border-gray-200 pb-3">Create an account</h2>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                Please enter your email address to create an account. You will be able to track your order history, manage addresses, and check out faster.
              </p>
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Email address</label>
                  <input type="email" placeholder="customer@example.com" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-500" />
                </div>
                <Link href="/register" className="inline-flex items-center gap-2 bg-[#82c91e] hover:bg-[#74b81b] text-white font-extrabold text-xs px-5 py-2.5 rounded shadow-xs">
                  <UserPlus className="w-4 h-4" />
                  <span>Create an account</span>
                </Link>
              </div>
            </div>

            {/* Sign In Box */}
            <div className="border border-gray-300 rounded bg-white p-6 space-y-4">
              <h2 className="text-sm font-black uppercase text-gray-900 border-b border-gray-200 pb-3">Already registered?</h2>
              <form className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Email address</label>
                  <input type="email" placeholder="you@domain.com" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-500" required />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Password</label>
                  <input type="password" placeholder="••••••••" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-500" required />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <button type="button" className="inline-flex items-center gap-2 bg-[#1e3a8a] hover:bg-blue-900 text-white font-extrabold text-xs px-6 py-2.5 rounded shadow-xs">
                    <Lock className="w-4 h-4" />
                    <span>Sign in</span>
                  </button>
                  <a href="#" className="text-xs text-sky-600 hover:underline font-bold">Forgot your password?</a>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>

      {store ? <StoreFooter store={store} /> : null}
    </div>
  );
}
