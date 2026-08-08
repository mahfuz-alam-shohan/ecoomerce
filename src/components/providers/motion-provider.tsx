'use client';

import React from 'react';
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';
import { NavigationStateProvider } from '@/components/providers/navigation-provider';

/**
 * Top-of-page instant route progress indicator & motion controller.
 * Eliminates perceived navigation delay (`0ms` response to every link click across the platform).
 */
export function AppProgressAndMotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NavigationStateProvider>
      <ProgressBar
        height="3px"
        color="var(--primary)"
        options={{ showSpinner: false }}
        shallowRouting
      />
      {children}
    </NavigationStateProvider>
  );
}
