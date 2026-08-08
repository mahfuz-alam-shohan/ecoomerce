'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Search, Menu, X, Home, Phone, Mail, Award, Package, ShieldCheck } from 'lucide-react';
import { StorefrontResolvedData } from '@/lib/types';
import { useCart } from '@/lib/cart-context';

interface StoreHeaderProps {
  store: StorefrontResolvedData;
}

export function StoreHeader({ store }: StoreHeaderProps) {
  const { themeConfig, storeConfig } = store;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { totalCount, subtotalInCents } = useCart();

  const currencySymbol = storeConfig.currency === 'USD' ? '$' : storeConfig.currency === 'EUR' ? '€' : 'BDT ';
  const subtotalFormatted = (subtotalInCents / 100).toFixed(2);

  return (
    <header className="w-full border-b border-gray-300 bg-white sticky top-0 z-50 shadow-xs font-sans">
      {/* 1. Top Contact & Stats Strip (RoboticsBD style) */}
      <div className="w-full bg-[#f8f9fa] border-b border-gray-200 py-1.5 px-4 text-[11px] text-gray-700 hidden lg:flex items-center justify-between">
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-1 font-semibold text-gray-800">
            <Phone className="w-3 h-3 text-[#82c91e]" /> Phone: 01792 007 004
          </span>
          <span className="flex items-center gap-1 font-semibold text-gray-800">
            <Mail className="w-3 h-3 text-[#82c91e]" /> Email: ask@{store.slug || 'roboticsbd'}.com
          </span>
          <span className="flex items-center gap-1 text-gray-600">
            <Award className="w-3 h-3 text-gray-500" /> Over 12 years of experience
          </span>
          <span className="flex items-center gap-1 text-gray-600">
            <Package className="w-3 h-3 text-gray-500" /> Over 4000 hardware parts
          </span>
          <span className="flex items-center gap-1 text-gray-600">
            <ShieldCheck className="w-3 h-3 text-gray-500" /> Over 80,000 shipped orders
          </span>
        </div>

        <div className="text-gray-700">
          Welcome, <Link href="/login" className="text-emerald-700 font-bold hover:underline">Sign in</Link> or <Link href="/register" className="text-emerald-700 font-bold hover:underline">Create an account</Link>
        </div>
      </div>

      {/* 2. Main Brand & Search Bar Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4 sm:gap-8">
        {/* Mobile Menu Toggle & Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-gray-900 rounded border border-gray-300 hover:bg-gray-100"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/" className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-2xl sm:text-3xl font-black text-[#1e3a8a] tracking-tighter uppercase">
                {store.name.split(' ')[0] || 'ROBOTICS'}
              </span>
              <span className="text-2xl sm:text-3xl font-black text-[#f97316] tracking-tighter uppercase">
                {store.name.split(' ').slice(1).join(' ') || 'BD'}
              </span>
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-sky-600 tracking-widest uppercase">
              DISCOVER YOURSELF
            </span>
          </Link>
        </div>

        {/* Traditional Center Search Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (searchQuery.trim()) {
              window.location.href = `/catalog?search=${encodeURIComponent(searchQuery.trim())}`;
            }
          }}
          className="hidden sm:flex flex-1 max-w-xl items-center border-2 border-gray-300 rounded overflow-hidden bg-white focus-within:border-sky-500 transition-colors"
        >
          <input
            type="text"
            placeholder="Search our catalog (e.g. Arduino, Jetson, Raspberry Pi, Sensor)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
          />
          <button
            type="submit"
            className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-2.5 flex items-center justify-center transition-colors shrink-0"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>

        {/* Right Green Cart Button */}
        <div className="flex items-center shrink-0">
          <Link
            href="/cart"
            className="flex items-center gap-2.5 bg-[#82c91e] hover:bg-[#74b81b] text-white font-extrabold px-4 sm:px-5 py-2.5 rounded shadow-sm text-xs sm:text-sm transition-colors"
          >
            <ShoppingCart className="w-4 h-4 shrink-0" />
            <span>
              Cart: {totalCount} Products – {currencySymbol}{subtotalFormatted}
            </span>
          </Link>
        </div>
      </div>

      {/* 3. Dark Navigation Bar (RoboticsBD black strip) */}
      <nav className="w-full bg-[#1c1c1c] text-white text-xs font-bold tracking-wider uppercase border-t border-gray-800">
        <div className="max-w-7xl mx-auto flex items-center overflow-x-auto scrollbar-none">
          <Link
            href="/"
            className="px-5 py-3.5 bg-[#2a2a2a] hover:bg-[#333] flex items-center justify-center border-r border-gray-800 transition-colors shrink-0"
            aria-label="Home"
          >
            <Home className="w-4 h-4 text-white" />
          </Link>

          <Link href="/catalog" className="px-5 py-3.5 hover:bg-gray-800 border-r border-gray-800 whitespace-nowrap transition-colors">
            PRODUCTS
          </Link>

          <Link href="/catalog?category=development-boards" className="px-5 py-3.5 hover:bg-gray-800 border-r border-gray-800 whitespace-nowrap transition-colors">
            DEV BOARDS
          </Link>

          <Link href="/catalog?category=sensors" className="px-5 py-3.5 hover:bg-gray-800 border-r border-gray-800 whitespace-nowrap transition-colors">
            SENSORS v
          </Link>

          <Link href="/catalog?category=electronics-module" className="px-5 py-3.5 hover:bg-gray-800 border-r border-gray-800 whitespace-nowrap transition-colors">
            ELECTRONICS MODULE v
          </Link>

          <Link href="/catalog?sort=newest" className="px-5 py-3.5 hover:bg-gray-800 border-r border-gray-800 whitespace-nowrap transition-colors">
            BACK IN STOCK
          </Link>

          <Link href="/catalog?sort=newest" className="px-5 py-3.5 hover:bg-gray-800 border-r border-gray-800 whitespace-nowrap transition-colors">
            NEW PRODUCTS
          </Link>

          <Link href="/catalog?sort=price_asc" className="px-5 py-3.5 hover:bg-gray-800 border-r border-gray-800 text-orange-400 whitespace-nowrap transition-colors">
            NEW DISCOUNT
          </Link>

          <Link href="/catalog?sort=price_asc" className="px-5 py-3.5 hover:bg-gray-800 border-r border-gray-800 whitespace-nowrap transition-colors">
            DISCOUNT
          </Link>

          <Link href="/catalog" className="px-5 py-3.5 hover:bg-gray-800 border-r border-gray-800 whitespace-nowrap transition-colors">
            INFO v
          </Link>

          <Link href="/checkout" className="px-5 py-3.5 hover:bg-gray-800 whitespace-nowrap transition-colors">
            CONTACT
          </Link>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-300 bg-gray-50 px-4 py-4 space-y-3 shadow-lg">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                window.location.href = `/catalog?search=${encodeURIComponent(searchQuery.trim())}`;
              }
            }}
            className="flex items-center border-2 border-gray-300 rounded overflow-hidden bg-white w-full"
          >
            <input
              type="text"
              placeholder="Search our catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 text-sm text-gray-800 focus:outline-none w-full"
            />
            <button type="submit" className="bg-sky-500 px-4 py-2 text-white font-bold text-xs">
              Search
            </button>
          </form>

          <div className="grid grid-cols-2 gap-2 text-xs font-bold pt-2">
            <Link href="/catalog" className="p-2.5 bg-white border border-gray-300 rounded text-center text-gray-800">
              ALL PRODUCTS
            </Link>
            <Link href="/catalog?category=development-boards" className="p-2.5 bg-white border border-gray-300 rounded text-center text-gray-800">
              DEV BOARDS
            </Link>
            <Link href="/catalog?category=sensors" className="p-2.5 bg-white border border-gray-300 rounded text-center text-gray-800">
              SENSORS
            </Link>
            <Link href="/catalog?category=3d-printer" className="p-2.5 bg-white border border-gray-300 rounded text-center text-gray-800">
              3D PRINTERS
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
