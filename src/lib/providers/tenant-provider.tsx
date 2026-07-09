'use client';

import { createContext, useContext } from 'react';

/**
 * TenantContext — Provides the resolved tenant and session data
 * to all dashboard child components without prop drilling.
 */

export interface TenantContextValue {
  tenant: {
    id: string;
    slug: string;
    name: string;
    themeConfig: any;
    storeConfig: any;
  };
  session: {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  };
}

const TenantContext = createContext<TenantContextValue | null>(null);

export function TenantProvider({
  value,
  children,
}: {
  value: TenantContextValue;
  children: React.ReactNode;
}) {
  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  );
}

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) {
    throw new Error('useTenant must be used within a <TenantProvider>');
  }
  return ctx;
}
