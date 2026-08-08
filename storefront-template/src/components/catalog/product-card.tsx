'use client';

import React from 'react';
import Link from 'next/link';
import { Product, ThemeConfig } from '@/lib/types';
import { ShoppingCart, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  themeConfig?: ThemeConfig;
  currencySymbol?: string;
}

export function ProductCard({ product, currencySymbol = 'BDT ' }: ProductCardProps) {
  const priceFormatted = (product.minPriceInCents / 100).toFixed(2);
  const compareAtFormatted = product.variants?.[0]?.compareAtPriceInCents
    ? (product.variants[0].compareAtPriceInCents / 100).toFixed(2)
    : null;

  const imageUrl = product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop';
  const isSoldOut = product.totalStock <= 0;

  return (
    <Link
      href={`/product/${product.handle || product.id}`}
      className="group flex flex-col justify-between border border-gray-200 bg-white p-3 rounded hover:border-gray-400 hover:shadow-sm transition-all font-sans relative"
    >
      {/* Thumbnail */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-50 rounded-xs mb-2.5 flex items-center justify-center">
        <img
          src={imageUrl}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />

        {compareAtFormatted && !isSoldOut && (
          <span className="absolute top-1.5 right-1.5 bg-red-600 text-white font-extrabold text-[10px] uppercase px-1.5 py-0.5 rounded shadow-2xs">
            Reduced price
          </span>
        )}

        {isSoldOut && (
          <span className="absolute inset-0 bg-white/80 flex items-center justify-center font-bold text-xs text-gray-700 uppercase">
            Sold Out
          </span>
        )}
      </div>

      {/* Product Information Box */}
      <div className="flex-1 flex flex-col justify-between space-y-1">
        <h3 className="text-xs font-bold text-gray-800 line-clamp-2 min-h-[32px] group-hover:text-emerald-700 transition-colors">
          {product.title}
        </h3>

        {/* Price Strip */}
        <div className="flex items-baseline gap-2 pt-1">
          <span className="text-sm font-black text-red-600">
            {currencySymbol}{priceFormatted}
          </span>
          {compareAtFormatted && (
            <span className="text-[11px] text-gray-400 line-through font-medium">
              {currencySymbol}{compareAtFormatted}
            </span>
          )}
        </div>
      </div>

      {/* Green Action Button */}
      <div
        className={`w-full mt-3 py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
          isSoldOut
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-[#82c91e] group-hover:bg-[#74b81b] text-white shadow-2xs'
        }`}
      >
        {isSoldOut ? (
          <span>Sold Out</span>
        ) : (
          <>
            <Eye className="w-3.5 h-3.5" />
            <span>See more</span>
          </>
        )}
      </div>
    </Link>
  );
}
