'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useNavigationState } from '@/components/providers/navigation-provider';
import PlatformLoadingScreen from '@/app/(platform)/platform/loading';
import TenantDashboardLoadingScreen from '@/app/(dashboard)/dashboard/[tenant_slug]/loading';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Silky Page / View Transition wrapper with instant click-to-loading responsiveness.
 * When `isNavigating` is triggered (`0ms` response to menu clicks), immediately displays
 * rich multi-style loading skeletons (`QuantumSpinner`, `HolographicCardSkeleton`, `StaggeredTableSkeleton`)
 * until server data completes and `pathname` updates.
 */
export function PageTransition({ children, className = '' }: PageTransitionProps) {
  const pathname = usePathname();
  const { isNavigating, targetRoute } = useNavigationState();

  // Determine which rich loading screen to display during active route transition
  const getLoadingScreen = () => {
    const routeToCheck = targetRoute || pathname;
    if (routeToCheck.startsWith('/platform')) {
      return <PlatformLoadingScreen />;
    }
    return <TenantDashboardLoadingScreen />;
  };

  return (
    <AnimatePresence mode="wait">
      {isNavigating ? (
        <motion.div
          key={`nav-loading-${targetRoute || 'loading'}`}
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.99 }}
          transition={{
            duration: 0.2,
            ease: 'easeInOut',
          }}
          className={`w-full flex-1 flex flex-col ${className}`}
        >
          {getLoadingScreen()}
        </motion.div>
      ) : (
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{
            type: 'spring',
            stiffness: 380,
            damping: 30,
            mass: 0.8,
          }}
          className={`w-full flex-1 flex flex-col ${className}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
