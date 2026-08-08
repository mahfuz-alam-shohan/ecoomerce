'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * 1. QuantumSpinner — Sci-fi dual-ring counter-rotating neon loader with glowing core.
 */
export function QuantumSpinner({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-2',
    lg: 'w-14 h-14 border-[3px]',
    xl: 'w-20 h-20 border-4',
  };

  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      {/* Outer Clockwise Ring */}
      <div
        className={cn(
          sizeClasses[size],
          'rounded-full border-primary border-t-transparent border-l-transparent animate-quantum-cw shadow-[0_0_12px_-2px_var(--primary)]'
        )}
      />
      {/* Inner Counter-Clockwise Ring */}
      <div
        className={cn(
          'absolute rounded-full border-cyan-500/80 border-b-transparent border-r-transparent animate-quantum-ccw shadow-[0_0_10px_-2px_rgba(6,182,212,0.8)]',
          size === 'sm' ? 'w-4 h-4 border' : size === 'md' ? 'w-6 h-6 border-2' : size === 'lg' ? 'w-9 h-9 border-2' : 'w-13 h-13 border-[3px]'
        )}
      />
      {/* Glowing Core Dot */}
      <div
        className={cn(
          'absolute rounded-full bg-primary animate-pulse shadow-[0_0_8px_var(--primary)]',
          size === 'sm' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-4 h-4'
        )}
      />
    </div>
  );
}

/**
 * 2. WaveEqualizer — Dynamic multi-bar animated wave loader.
 * Excellent for chart transitions, analytics loading, and live telemetry.
 */
export function WaveEqualizer({ className, bars = 5, color = 'bg-primary' }: { className?: string; bars?: number; color?: string }) {
  return (
    <div className={cn('flex items-center gap-1 h-8', className)}>
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className={cn('w-1.5 rounded-full animate-wave-bar', color)}
          style={{
            height: '100%',
            animationDelay: `${i * 0.14}s`,
          }}
        />
      ))}
    </div>
  );
}

/**
 * 3. RadarPulseLoader — Concentric expanding radar rings for live telemetry / store sync.
 */
export function RadarPulseLoader({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div className={cn('relative flex items-center justify-center p-6', className)}>
      {/* Outer Ripple 1 */}
      <div className="absolute inset-0 m-auto w-16 h-16 rounded-full border border-primary/40 animate-radar-ring pointer-events-none" />
      {/* Outer Ripple 2 (Delayed) */}
      <div
        className="absolute inset-0 m-auto w-16 h-16 rounded-full border border-cyan-500/40 animate-radar-ring pointer-events-none"
        style={{ animationDelay: '1s' }}
      />
      {/* Center content or glowing sphere */}
      <div className="relative z-10 flex items-center justify-center w-12 h-12 rounded-2xl bg-card border border-border/80 shadow-md">
        {children || <QuantumSpinner size="sm" />}
      </div>
    </div>
  );
}

/**
 * 4. HolographicCardSkeleton — Premium KPI / Summary Card Loader with diagonal light sweep & radar indicator.
 */
export function HolographicCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-sm space-y-4 animate-stagger',
        className
      )}
    >
      {/* Holographic light beam overlay */}
      <div className="absolute inset-0 animate-holographic pointer-events-none" />

      {/* Top Header Row with Radar Badge */}
      <div className="flex items-center justify-between relative z-10">
        <div className="h-3.5 w-28 rounded-md bg-muted/70 animate-shimmer" />
        <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-primary/10 border border-primary/20">
          <div className="w-2 h-2 rounded-full bg-primary animate-ping absolute" />
          <div className="w-2 h-2 rounded-full bg-primary" />
        </div>
      </div>

      {/* Big Number / Title Area */}
      <div className="space-y-2 relative z-10">
        <div className="h-8 w-24 rounded-lg bg-muted/90 animate-shimmer" />
        <div className="flex items-center gap-2">
          <div className="h-4 w-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 animate-shimmer" />
          <div className="h-3 w-32 rounded bg-muted/50 animate-shimmer" />
        </div>
      </div>

      {/* Mini Chart / Sparkline Equalizer */}
      <div className="pt-2 flex items-end gap-1.5 h-10 border-t border-border/30 relative z-10">
        {[40, 65, 30, 85, 55, 95, 70, 50, 80, 60, 90, 75].map((height, idx) => (
          <div
            key={idx}
            className="flex-1 rounded-t bg-primary/20 animate-wave-bar"
            style={{
              height: `${height}%`,
              animationDelay: `${idx * 0.08}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * 5. StaggeredTableSkeleton — High-tech table/list loader with wave row entry & multi-style data badges.
 */
export function StaggeredTableSkeleton({ rows = 5, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-4 relative overflow-hidden', className)}>
      <div className="absolute inset-0 animate-holographic pointer-events-none" />

      {/* Table Header Row */}
      <div className="flex items-center justify-between pb-4 border-b border-border/50 relative z-10">
        <div className="flex items-center gap-3">
          <QuantumSpinner size="sm" />
          <div className="h-5 w-40 rounded-md bg-muted/70 animate-shimmer" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-32 rounded-xl bg-muted/50 animate-shimmer" />
          <div className="h-8 w-24 rounded-xl bg-primary/15 border border-primary/25 animate-shimmer" />
        </div>
      </div>

      {/* Staggered Rows */}
      <div className="space-y-3 pt-1 relative z-10">
        {Array.from({ length: rows }).map((_, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between py-3 px-3 rounded-xl border border-border/30 bg-muted/10 animate-stagger"
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            {/* Left Col: Avatar + Text */}
            <div className="flex items-center gap-3.5">
              <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-muted/60 border border-border/60 overflow-hidden">
                <div className="w-5 h-5 rounded-full bg-primary/20 animate-ping absolute" />
                <div className="w-4 h-4 rounded bg-muted-foreground/30 animate-shimmer" />
              </div>
              <div className="space-y-1.5">
                <div className="h-4 w-44 rounded-md bg-muted/80 animate-shimmer" />
                <div className="h-3 w-28 rounded bg-muted/40 animate-shimmer" />
              </div>
            </div>

            {/* Middle Col: Equalizer Mini Badge */}
            <div className="hidden md:flex items-center gap-2">
              <WaveEqualizer bars={3} className="h-4" color="bg-cyan-500/60" />
              <div className="h-3.5 w-20 rounded bg-muted/50 animate-shimmer" />
            </div>

            {/* Right Col: Status Pill + Actions */}
            <div className="flex items-center gap-4">
              <div className="h-6 w-24 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center px-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5" />
                <div className="h-2 w-12 rounded bg-emerald-500/40 animate-shimmer" />
              </div>
              <div className="h-8 w-8 rounded-lg bg-muted/40 animate-shimmer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
