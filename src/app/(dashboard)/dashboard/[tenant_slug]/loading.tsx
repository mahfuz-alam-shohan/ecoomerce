'use client';

import React from 'react';
import {
  QuantumSpinner,
  HolographicCardSkeleton,
  StaggeredTableSkeleton,
} from '@/components/ui/loading-motions';

/**
 * Tenant Store Dashboard Loading Screen.
 * Features a variety of distinct loading styles across header, KPI cards, and data tables.
 */
export default function TenantDashboardLoadingScreen() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Store Header Banner with Quantum Spinner & Holographic Sweep */}
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="absolute inset-0 animate-holographic pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <QuantumSpinner size="md" />
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-7 w-56 rounded-lg bg-muted/80 animate-shimmer" />
              <div className="h-5 w-24 rounded-full bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center px-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping mr-1.5" />
                <div className="h-2 w-12 rounded bg-cyan-500/60 animate-shimmer" />
              </div>
            </div>
            <div className="h-3.5 w-64 rounded bg-muted/50 animate-shimmer" />
          </div>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <div className="h-10 w-32 rounded-xl bg-muted/60 animate-shimmer" />
          <div className="h-10 w-40 rounded-xl bg-primary/20 border border-primary/30 animate-shimmer" />
        </div>
      </div>

      {/* KPI Metrics Grid — 4 Holographic Cards with Equalizer Waves */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <HolographicCardSkeleton />
        <HolographicCardSkeleton />
        <HolographicCardSkeleton />
        <HolographicCardSkeleton />
      </div>

      {/* Staggered Rows Table View */}
      <StaggeredTableSkeleton rows={6} />
    </div>
  );
}
