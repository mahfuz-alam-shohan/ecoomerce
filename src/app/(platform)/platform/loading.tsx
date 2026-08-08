'use client';

import React from 'react';
import {
  QuantumSpinner,
  HolographicCardSkeleton,
  StaggeredTableSkeleton,
} from '@/components/ui/loading-motions';

/**
 * Super Admin Platform Dashboard Loading Screen.
 * Features a variety of state-of-the-art loading motions:
 * - Sci-fi double ring counter-rotating QuantumSpinner
 * - Holographic light-sweeping KPI cards with animated equalizer bars
 * - Staggered row entry table skeletons with radar badges
 */
export default function PlatformLoadingScreen() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title & Action Bar with Quantum Loader & Holographic Sweep */}
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="absolute inset-0 animate-holographic pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <QuantumSpinner size="md" />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-6 w-48 rounded-lg bg-muted/80 animate-shimmer" />
              <div className="h-5 w-20 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center px-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping mr-1.5" />
                <div className="h-2 w-10 rounded bg-primary/60 animate-shimmer" />
              </div>
            </div>
            <div className="h-3.5 w-64 rounded bg-muted/50 animate-shimmer" />
          </div>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <div className="h-10 w-28 rounded-xl bg-muted/60 animate-shimmer" />
          <div className="h-10 w-36 rounded-xl bg-primary/20 border border-primary/30 animate-shimmer" />
        </div>
      </div>

      {/* KPI Cards Grid — 4 Holographic Cards with Wave Equalizers */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <HolographicCardSkeleton />
        <HolographicCardSkeleton />
        <HolographicCardSkeleton />
        <HolographicCardSkeleton />
      </div>

      {/* Main Table / Data List View Skeleton with Staggered Entrance */}
      <StaggeredTableSkeleton rows={5} />
    </div>
  );
}
