'use client';

import React from 'react';
import Link from 'next/link';
import { Category } from '@/lib/types';
import { ChevronRight, Layers } from 'lucide-react';

interface CategorySidebarProps {
  categories: Category[];
  activeCategoryId?: string;
}

export function CategorySidebar({ categories, activeCategoryId }: CategorySidebarProps) {
  const displayCategories = categories && categories.length > 0 ? categories : [];

  return (
    <aside className="w-64 shrink-0 border border-gray-300 bg-white rounded-t-sm shadow-xs hidden md:block select-none self-start">
      <div className="bg-gray-100 border-b border-gray-300 px-4 py-3 font-black text-xs text-gray-900 uppercase tracking-wider flex items-center gap-2">
        <Layers className="w-4 h-4 text-gray-700" />
        <span>MENU CATEGORIES</span>
      </div>

      <div className="divide-y divide-gray-200 max-h-[850px] overflow-y-auto">
        {displayCategories.length === 0 ? (
          <div className="p-4 text-xs text-gray-500 italic">No categories available</div>
        ) : (
          displayCategories.map((cat) => {
            const isActive = activeCategoryId === cat.id;
            return (
              <Link
                key={cat.id}
                href={`/catalog?category=${cat.id}`}
                className={`flex items-center justify-between px-4 py-2.5 text-xs font-bold transition-all border-l-4 ${
                  isActive
                    ? 'border-[#82c91e] bg-emerald-50/70 text-emerald-800'
                    : 'border-transparent text-gray-800 hover:border-[#82c91e] hover:bg-gray-50 hover:text-emerald-700'
                }`}
              >
                <span className="truncate pr-2">{cat.name}</span>
                <span className="text-gray-400 text-sm font-mono">+</span>
              </Link>
            );
          })
        )}
      </div>

      {/* Quick Contact & Shipping Strip below sidebar */}
      <div className="p-4 bg-gray-50 border-t border-gray-300 space-y-2 text-[11px] text-gray-600">
        <div className="font-bold text-gray-800 flex items-center gap-1">
          <span>📦 Next Shipment:</span>
          <span className="text-[#82c91e] font-black">Pathao, Redx</span>
        </div>
        <p>Over 12 years of experience & 80,000+ orders delivered safely nationwide.</p>
      </div>
    </aside>
  );
}
