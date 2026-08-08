'use client';

import React from 'react';
import { TrustBadge } from '@/lib/types';
import { ShieldCheck, Truck, RefreshCw, Headphones, Award, CheckCircle } from 'lucide-react';

interface TrustBadgesProps {
  badges: TrustBadge[];
}

export function TrustBadgesSection({ badges }: TrustBadgesProps) {
  if (!badges || badges.length === 0) return null;

  const renderIcon = (iconName: string) => {
    switch (iconName?.toLowerCase()) {
      case 'shield':
        return <ShieldCheck className="w-8 h-8 text-primary shrink-0" />;
      case 'truck':
        return <Truck className="w-8 h-8 text-primary shrink-0" />;
      case 'refresh':
        return <RefreshCw className="w-8 h-8 text-primary shrink-0" />;
      case 'support':
        return <Headphones className="w-8 h-8 text-primary shrink-0" />;
      case 'award':
        return <Award className="w-8 h-8 text-primary shrink-0" />;
      default:
        return <CheckCircle className="w-8 h-8 text-primary shrink-0" />;
    }
  };

  return (
    <section className="bg-gray-50 border-b border-gray-200 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className="flex items-start gap-4 p-5 rounded-xl bg-white border border-gray-200/80 shadow-sm hover:shadow transition-shadow"
            >
              <div className="p-2.5 rounded-lg bg-blue-50/80 text-blue-600">
                {renderIcon(badge.icon)}
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-gray-900">{badge.title}</h3>
                <p className="text-xs text-gray-600 leading-normal">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
