'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { ThemeConfig, StoreConfig } from '@/lib/types';
import { Trash2, ArrowRight, ShoppingBag, ShieldCheck, ArrowLeft } from 'lucide-react';

interface CartViewProps {
  themeConfig: ThemeConfig;
  storeConfig: StoreConfig;
}

export function CartView({ themeConfig, storeConfig }: CartViewProps) {
  const { items, updateQuantity, removeItem, clearCart, subtotalInCents } = useCart();

  const currencySymbol = storeConfig.currency === 'USD' ? '$' : storeConfig.currency === 'EUR' ? '€' : '৳';
  const taxRate = storeConfig.taxRatePercent || 0;
  const taxInCents = Math.round(subtotalInCents * (taxRate / 100));

  const freeThreshold = storeConfig.freeShippingThresholdCents ?? 10000;
  const shippingInCents = items.length === 0 ? 0 : subtotalInCents >= freeThreshold ? 0 : 1200;
  const totalAmountInCents = subtotalInCents + taxInCents + shippingInCents;

  if (items.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center bg-gray-50 rounded-3xl border border-dashed border-gray-300 my-8 space-y-4 max-w-2xl mx-auto p-6">
        <div className="p-5 rounded-full bg-blue-100/60 text-blue-600">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900">Your Shopping Bag is Empty</h2>
        <p className="text-sm sm:text-base text-gray-600 max-w-md">
          Looks like you haven&apos;t added anything to your cart yet. Explore our latest handpicked items and deals.
        </p>
        <div className="pt-2">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white shadow-md transition-transform hover:scale-105"
            style={{ backgroundColor: themeConfig.primaryColor || '#3b82f6' }}
          >
            <span>Start Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 py-8">
      {/* Col 1 & 2: Cart Items Table List */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <h2 className="text-xl font-extrabold text-gray-900">
            Cart Items ({items.length})
          </h2>
          <button
            onClick={clearCart}
            className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear All Items
          </button>
        </div>

        <div className="divide-y divide-gray-200 border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
          {items.map((item) => {
            const itemPrice = (item.priceInCents / 100).toFixed(2);
            const itemTotal = ((item.priceInCents * item.quantity) / 100).toFixed(2);

            return (
              <div key={item.variantId} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <Link href={`/product/${item.productId}`} className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                    <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                  </Link>

                  <div className="space-y-1">
                    <Link href={`/product/${item.productId}`}>
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base hover:text-blue-600 transition-colors line-clamp-1">
                        {item.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-gray-400 font-mono">SKU: {item.sku}</p>
                    <p className="text-xs font-bold text-gray-700">
                      Unit: {currencySymbol}{itemPrice}
                    </p>
                  </div>
                </div>

                {/* Quantity & Item Total */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  <div className="flex items-center border border-gray-300 rounded-xl bg-gray-50 px-2 py-1">
                    <button
                      onClick={() => updateQuantity(item.variantId, -1)}
                      className="w-7 h-7 rounded-lg bg-white border border-gray-200 text-gray-700 font-bold hover:bg-gray-100 transition-colors"
                    >
                      -
                    </button>
                    <span className="font-bold text-sm px-3 text-gray-900">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.variantId, 1)}
                      disabled={item.quantity >= item.maxStock}
                      className="w-7 h-7 rounded-lg bg-white border border-gray-200 text-gray-700 font-bold hover:bg-gray-100 disabled:opacity-40 transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right shrink-0 min-w-[80px]">
                    <p className="text-base font-black text-gray-900">
                      {currencySymbol}{itemTotal}
                    </p>
                  </div>

                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <Link href="/catalog" className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900 pt-2">
          <ArrowLeft className="w-4 h-4" /> Continue Shopping
        </Link>
      </div>

      {/* Col 3: Order Summary Card */}
      <div className="lg:col-span-1">
        <div className="sticky top-28 rounded-2xl border border-gray-200 bg-gray-50 p-6 space-y-6 shadow-sm">
          <h3 className="text-lg font-extrabold text-gray-900 border-b border-gray-200 pb-3">
            Order Summary
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between text-gray-600">
              <span>Subtotal ({items.length} items)</span>
              <span className="font-bold text-gray-900">{currencySymbol}{(subtotalInCents / 100).toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between text-gray-600">
              <span>Estimated Tax ({taxRate}%)</span>
              <span className="font-bold text-gray-900">{currencySymbol}{(taxInCents / 100).toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between text-gray-600">
              <span>Shipping Estimate</span>
              {shippingInCents === 0 ? (
                <span className="font-bold text-emerald-600 uppercase">FREE</span>
              ) : (
                <span className="font-bold text-gray-900">{currencySymbol}{(shippingInCents / 100).toFixed(2)}</span>
              )}
            </div>

            {shippingInCents > 0 && (
              <p className="text-xs text-blue-600 font-medium bg-blue-50 p-2.5 rounded-xl border border-blue-100">
                💡 Add {currencySymbol}{((freeThreshold - subtotalInCents) / 100).toFixed(2)} more to qualify for FREE express shipping!
              </p>
            )}

            <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
              <span className="text-base font-bold text-gray-900">Total Order Cost</span>
              <span className="text-2xl font-black text-gray-900">
                {currencySymbol}{(totalAmountInCents / 100).toFixed(2)}
              </span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="w-full py-4 rounded-xl font-extrabold text-base text-white shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: themeConfig.primaryColor || '#3b82f6' }}
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-5 h-5" />
          </Link>

          <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-500 pt-2 border-t border-gray-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted 256-Bit SSL Checkout Guarantee</span>
          </div>
        </div>
      </div>
    </div>
  );
}
