'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import { ThemeConfig, StoreConfig } from '@/lib/types';
import { ShieldCheck, Lock, CreditCard, Banknote, Building2, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface CheckoutFormProps {
  tenantId: string;
  themeConfig: ThemeConfig;
  storeConfig: StoreConfig;
}

export function CheckoutForm({ tenantId, themeConfig, storeConfig }: CheckoutFormProps) {
  const router = useRouter();
  const { items, subtotalInCents, clearCart } = useCart();

  const [customer, setCustomer] = useState({
    fullName: '',
    email: '',
    phone: '',
    addressLine1: '',
    city: '',
    postalCode: '',
    country: 'United States',
  });
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank_transfer' | 'sandbox'>('cod');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currencySymbol = storeConfig.currency === 'USD' ? '$' : storeConfig.currency === 'EUR' ? '€' : '৳';
  const taxRate = storeConfig.taxRatePercent || 0;
  const taxInCents = Math.round(subtotalInCents * (taxRate / 100));
  const freeThreshold = storeConfig.freeShippingThresholdCents ?? 10000;
  const shippingInCents = items.length === 0 ? 0 : subtotalInCents >= freeThreshold ? 0 : 1200;
  const totalAmountInCents = subtotalInCents + taxInCents + shippingInCents;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setErrorMsg('Your bag is empty');
      return;
    }
    if (!customer.fullName || !customer.email || !customer.addressLine1) {
      setErrorMsg('Please fill in all required delivery fields.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_STORE_API_URL || 'http://localhost:3000';
      const apiKey = process.env.NEXT_PUBLIC_STOREFRONT_TOKEN;

      const res = await fetch(`${apiUrl}/api/v1/storefront/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Storefront-Token': apiKey || '',
        },
        body: JSON.stringify({
          tenantId,
          apiKey,
          customer,
          items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
          paymentMethod,
          notes,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Checkout verification failed');
      }

      clearCart();
      router.push(`/order-confirmed?orderNumber=${json.data.orderNumber}&total=${json.data.totalAmountInCents}&status=${json.data.status}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error occurred during checkout');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-20 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300 space-y-4">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto" />
        <h2 className="text-xl font-bold text-gray-900">No Items to Checkout</h2>
        <Link href="/catalog" className="inline-block px-6 py-3 rounded-xl bg-gray-900 text-white font-bold text-sm">
          Return to Catalog
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10 py-6">
      {/* Col 1 & 2: Delivery & Payment Details Form */}
      <div className="lg:col-span-2 space-y-8">
        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-bold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1. Shipping Information Box */}
        <div className="p-6 sm:p-8 rounded-2xl border border-gray-200 bg-white shadow-sm space-y-6">
          <div className="border-b border-gray-200 pb-3 flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-white text-xs">1</span>
              <span>Delivery Address</span>
            </h2>
            <span className="text-xs font-semibold text-gray-400">* Required Fields</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Full Name *</label>
              <input
                type="text"
                required
                placeholder="John Doe"
                value={customer.fullName}
                onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Email Address *</label>
              <input
                type="email"
                required
                placeholder="john@example.com"
                value={customer.email}
                onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="+1 (555) 019-2834"
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Street Address *</label>
              <input
                type="text"
                required
                placeholder="123 Retail Way, Suite 4B"
                value={customer.addressLine1}
                onChange={(e) => setCustomer({ ...customer, addressLine1: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">City *</label>
              <input
                type="text"
                required
                placeholder="Los Angeles"
                value={customer.city}
                onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Postal / Zip Code *</label>
              <input
                type="text"
                required
                placeholder="90001"
                value={customer.postalCode}
                onChange={(e) => setCustomer({ ...customer, postalCode: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* 2. Payment Method Selector Box */}
        <div className="p-6 sm:p-8 rounded-2xl border border-gray-200 bg-white shadow-sm space-y-6">
          <div className="border-b border-gray-200 pb-3">
            <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-white text-xs">2</span>
              <span>Payment Option</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {storeConfig.features?.enableCod && (
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-5 rounded-xl border-2 text-left flex flex-col justify-between transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-gray-200 bg-gray-50/60 hover:bg-gray-100'
                }`}
                style={paymentMethod === 'cod' ? { borderColor: themeConfig.primaryColor } : {}}
              >
                <Banknote className="w-7 h-7 text-emerald-600 mb-3" />
                <div>
                  <h3 className="font-bold text-sm text-gray-900">Cash on Delivery</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Pay upon doorstep receipt</p>
                </div>
              </button>
            )}

            {storeConfig.features?.enableBankTransfer && (
              <button
                type="button"
                onClick={() => setPaymentMethod('bank_transfer')}
                className={`p-5 rounded-xl border-2 text-left flex flex-col justify-between transition-all ${
                  paymentMethod === 'bank_transfer'
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-gray-200 bg-gray-50/60 hover:bg-gray-100'
                }`}
                style={paymentMethod === 'bank_transfer' ? { borderColor: themeConfig.primaryColor } : {}}
              >
                <Building2 className="w-7 h-7 text-blue-600 mb-3" />
                <div>
                  <h3 className="font-bold text-sm text-gray-900">Bank Transfer</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Direct wire / IBAN transfer</p>
                </div>
              </button>
            )}

            {storeConfig.features?.enableSandboxPay && (
              <button
                type="button"
                onClick={() => setPaymentMethod('sandbox')}
                className={`p-5 rounded-xl border-2 text-left flex flex-col justify-between transition-all ${
                  paymentMethod === 'sandbox'
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-gray-200 bg-gray-50/60 hover:bg-gray-100'
                }`}
                style={paymentMethod === 'sandbox' ? { borderColor: themeConfig.primaryColor } : {}}
              >
                <CreditCard className="w-7 h-7 text-purple-600 mb-3" />
                <div>
                  <h3 className="font-bold text-sm text-gray-900">Sandbox Instant Pay</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Simulate instant card settlement</p>
                </div>
              </button>
            )}
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Order Notes / Delivery Instructions (Optional)</label>
            <textarea
              rows={3}
              placeholder="e.g., Leave package at front gate or call upon arrival..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Col 3: Final Checkout Summary Sidebar */}
      <div className="lg:col-span-1">
        <div className="sticky top-28 rounded-2xl border border-gray-200 bg-gray-50 p-6 space-y-6 shadow-sm">
          <h3 className="text-lg font-extrabold text-gray-900 border-b border-gray-200 pb-3">
            Review Order ({items.length} items)
          </h3>

          <div className="divide-y divide-gray-200 max-h-60 overflow-y-auto pr-1 space-y-3">
            {items.map((i) => (
              <div key={i.variantId} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="font-bold text-gray-900 shrink-0">{i.quantity}x</span>
                  <span className="text-gray-700 truncate">{i.title}</span>
                </div>
                <span className="font-bold text-gray-900 shrink-0">
                  {currencySymbol}{((i.priceInCents * i.quantity) / 100).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-2.5 text-sm">
            <div className="flex items-center justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-bold text-gray-900">{currencySymbol}{(subtotalInCents / 100).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-gray-600">
              <span>Tax ({taxRate}%)</span>
              <span className="font-bold text-gray-900">{currencySymbol}{(taxInCents / 100).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-gray-600">
              <span>Shipping Cost</span>
              {shippingInCents === 0 ? (
                <span className="font-bold text-emerald-600">FREE</span>
              ) : (
                <span className="font-bold text-gray-900">{currencySymbol}{(shippingInCents / 100).toFixed(2)}</span>
              )}
            </div>
            <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
              <span className="text-base font-extrabold text-gray-900">Total to Pay</span>
              <span className="text-2xl font-black text-gray-900">
                {currencySymbol}{(totalAmountInCents / 100).toFixed(2)}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl font-extrabold text-base text-white shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            style={{ backgroundColor: themeConfig.primaryColor || '#3b82f6' }}
          >
            <Lock className="w-5 h-5" />
            <span>{loading ? 'Processing Order...' : `Place Order (${currencySymbol}${(totalAmountInCents / 100).toFixed(2)})`}</span>
          </button>

          <Link href="/cart" className="block text-center text-xs font-bold text-gray-500 hover:text-gray-900">
            ← Return to Shopping Bag
          </Link>
        </div>
      </div>
    </form>
  );
}
