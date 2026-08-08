'use client';

import React from 'react';
import { QuantumSpinner, HolographicCardSkeleton } from '@/components/ui/loading-motions';

/**
 * Storefront Builder Loading Screen
 * Renders holographic card skeletons and quantum spinners while the CMS editor initializes.
 */
export default function StorefrontBuilderLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="relative overflow-hidden rounded-xl border border-border/60 bg-card/80 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="absolute inset-0 animate-holographic pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <QuantumSpinner size="md" />
          <div className="space-y-2">
            <div className="h-6 w-64 rounded-lg bg-muted/80 animate-shimmer" />
            <div className="h-4 w-96 rounded bg-muted/50 animate-shimmer" />
          </div>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <div className="h-9 w-28 rounded-lg bg-muted/60 animate-shimmer" />
          <div className="h-9 w-44 rounded-lg bg-primary/20 border border-primary/30 animate-shimmer" />
        </div>
      </div>

      <div className="h-12 w-full rounded-xl bg-muted/60 animate-shimmer" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <HolographicCardSkeleton className="h-[350px]" />
        <HolographicCardSkeleton className="h-[350px]" />
      </div>
    </div>
  );
}
