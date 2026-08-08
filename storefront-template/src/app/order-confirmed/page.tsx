import React from 'react';
import Link from 'next/link';
import { resolveStorefront } from '@/lib/storefront-client';
import { StoreHeader } from '@/components/layout/store-header';
import { StoreFooter } from '@/components/layout/store-footer';
import { CheckCircle2, PackageCheck, ArrowRight, Home } from 'lucide-react';

export const revalidate = 0;

export default async function OrderConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ orderNumber?: string; total?: string; status?: string }>;
}) {
  const resolvedParams = await searchParams;
  const store = await resolveStorefront();

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center bg-gray-50">
        <h1 className="text-xl font-bold text-gray-800">Storefront Connection Error</h1>
      </div>
    );
  }

  const { themeConfig, storeConfig } = store;
  const currencySymbol = storeConfig.currency === 'USD' ? '$' : storeConfig.currency === 'EUR' ? '€' : '৳';
  const totalPaid = resolvedParams?.total ? (Number(resolvedParams.total) / 100).toFixed(2) : '0.00';

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <StoreHeader store={store} />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full flex flex-col items-center text-center space-y-8">
        <div className="h-24 w-24 rounded-full bg-emerald-100/80 text-emerald-600 flex items-center justify-center shadow-md">
          <CheckCircle2 className="w-14 h-14" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold uppercase tracking-widest">
            Order Successfully Placed
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
            Thank You For Your Order!
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto">
            We have received your request and commenced processing. A confirmation invoice has been dispatched to your email address.
          </p>
        </div>

        {/* Order Details Receipt Box */}
        <div className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-6 sm:p-8 space-y-5 shadow-sm text-left">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Order Reference</span>
            <span className="text-lg font-mono font-extrabold text-gray-900">{resolvedParams?.orderNumber || 'ORD-UNKNOWN'}</span>
          </div>

          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</span>
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-xs uppercase">
              {resolvedParams?.status || 'Pending'}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-sm font-bold text-gray-700">Total Amount Payable</span>
            <span className="text-2xl font-black text-gray-900">
              {currencySymbol}{totalPaid}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full pt-4">
          <Link
            href="/catalog"
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-105"
            style={{ backgroundColor: themeConfig.primaryColor || '#3b82f6' }}
          >
            <PackageCheck className="w-5 h-5" />
            <span>Continue Shopping</span>
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </main>

      <StoreFooter store={store} />
    </div>
  );
}
