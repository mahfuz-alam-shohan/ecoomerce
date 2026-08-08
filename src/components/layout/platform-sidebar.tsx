'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useNavigationState } from '@/components/providers/navigation-provider';
import { QuantumSpinner } from '@/components/ui/loading-motions';
import {
  LayoutDashboard,
  Building2,
  Layers,
  Shield,
} from 'lucide-react';

/**
 * PlatformSidebar — Navigation for the Super Admin platform with instant 0ms click feedback.
 */

const navItems = [
  { label: 'Overview', icon: LayoutDashboard, href: '/platform' },
  { label: 'Tenants', icon: Building2, href: '/platform/tenants' },
  { label: 'Templates', icon: Layers, href: '/platform/templates' },
];

export function PlatformSidebar() {
  const pathname = usePathname();
  const { startNavigation, isNavigating, targetRoute } = useNavigationState();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border/50 bg-sidebar">
      <div className="flex h-16 items-center gap-3 border-b border-border/50 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Shield className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-sidebar-foreground">
            ECom Platform
          </span>
          <span className="text-xs text-muted-foreground">Super Admin</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive =
            item.href === '/platform'
              ? pathname === '/platform'
              : pathname.startsWith(item.href);

          const isClickingThis = isNavigating && targetRoute === item.href;

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => startNavigation(item.href)}
              className={cn(
                'flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive || isClickingThis
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </div>
              {isClickingThis && (
                <QuantumSpinner size="sm" />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
