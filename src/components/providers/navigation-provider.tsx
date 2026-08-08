'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface NavigationContextType {
  isNavigating: boolean;
  targetRoute: string | null;
  startNavigation: (href: string) => void;
}

const NavigationContext = createContext<NavigationContextType>({
  isNavigating: false,
  targetRoute: null,
  startNavigation: () => {},
});

/**
 * NavigationStateProvider — Eliminates Next.js App Router "frozen click" delays.
 * When a user clicks any menu link, this immediately triggers instant loading animations
 * (`isNavigating = true`), ending smoothly as soon as the server finishes loading data and
 * `pathname` updates.
 */
export function NavigationStateProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const [targetRoute, setTargetRoute] = useState<string | null>(null);

  // When pathname updates (server data finished loading and route switched),
  // instantly end the loading animation state!
  useEffect(() => {
    if (isNavigating) {
      setIsNavigating(false);
      setTargetRoute(null);
    }
  }, [pathname]);

  const startNavigation = (href: string) => {
    // Only trigger if we are navigating to a different route
    if (href !== pathname && !href.startsWith('#')) {
      setIsNavigating(true);
      setTargetRoute(href);
    }
  };

  return (
    <NavigationContext.Provider value={{ isNavigating, targetRoute, startNavigation }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigationState() {
  return useContext(NavigationContext);
}
