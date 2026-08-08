'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useTenant } from '@/lib/providers/tenant-provider';
import { useNavigationState } from '@/components/providers/navigation-provider';
import { QuantumSpinner } from '@/components/ui/loading-motions';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Settings,
  Store,
  Sparkles,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

/**
 * DashboardSidebar — Main navigation for the tenant dashboard with instant 0ms click feedback.
 * Highlights active route. Shows tenant branding at top.
 */

const navItems = [
  { label: 'Overview', icon: LayoutDashboard, href: '' },
  { label: 'Products', icon: Package, href: '/products' },
  { label: 'Categories', icon: FolderTree, href: '/categories' },
  { label: 'Orders', icon: ShoppingCart, href: '/orders' },
  { label: 'Storefront Content', icon: Sparkles, href: '/storefront-builder' },
  { label: 'Store Settings', icon: Settings, href: '/settings' },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { tenant } = useTenant();
  const { startNavigation, isNavigating, targetRoute } = useNavigationState();
  const basePath = `/dashboard/${tenant.slug}`;

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border/50 bg-sidebar">
      {/* Tenant Branding */}
      <div className="flex h-16 items-center gap-3 border-b border-border/50 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Store className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-sidebar-foreground truncate max-w-[160px]">
            {tenant.name}
          </span>
          <span className="text-xs text-muted-foreground">Dashboard</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const fullPath = `${basePath}${item.href}`;
          const isActive =
            item.href === ''
              ? pathname === basePath || pathname === `${basePath}/`
              : pathname.startsWith(fullPath);

          const isClickingThis = isNavigating && targetRoute === fullPath;

          return (
            <Link
              key={item.label}
              href={fullPath}
              onClick={() => startNavigation(fullPath)}
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

      {/* Bottom Section */}
      <div className="border-t border-border/50 p-3">
        <Link
          href="/platform"
          onClick={() => startNavigation('/platform')}
          className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all duration-200"
        >
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-4 w-4" />
            <span>Platform Admin</span>
          </div>
          {isNavigating && targetRoute === '/platform' && (
            <QuantumSpinner size="sm" />
          )}
        </Link>
      </div>
    </aside>
  );
}
