'use client';

import React from 'react';
import Link from 'next/link';
import { PromoAdBanner } from '@/lib/types';
import { Tag } from 'lucide-react';

interface PromoBannerSectionProps {
  promos: PromoAdBanner[];
  position: 'home_top' | 'home_middle' | 'catalog_top';
}

export function PromoBannerSection({ promos, position }: PromoBannerSectionProps) {
  const activePromos = promos?.filter((p) => p.isActive && p.position === position) || [];
  if (activePromos.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
      {activePromos.map((promo) => (
        <div
          key={promo.id}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md"
        >
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold uppercase tracking-wider">
              <Tag className="w-3.5 h-3.5" />
              <span>Special Offer</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{promo.title}</h2>
            <p className="text-sm sm:text-base text-blue-100 leading-relaxed">{promo.description}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full md:w-auto">
            {promo.discountCode && (
              <div className="px-4 py-3 rounded-xl bg-white/15 border border-white/20 text-center text-sm font-mono tracking-wider select-all">
                CODE: <span className="font-extrabold text-amber-300">{promo.discountCode}</span>
              </div>
            )}
            <Link
              href={promo.targetUrl || '/catalog'}
              className="px-6 py-3 rounded-xl bg-white text-blue-900 font-bold text-sm hover:bg-blue-50 transition-colors text-center shadow-sm"
            >
              Shop Collection
            </Link>
          </div>
        </div>
      ))}
    </section>
  );
}
