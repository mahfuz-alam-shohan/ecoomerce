'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useTenant } from '@/lib/providers/tenant-provider';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Settings,
  Store,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

/**
 * DashboardSidebar — Main navigation for the tenant dashboard.
 * Highlights active route. Shows tenant branding at top.
 */

const navItems = [
  { label: 'Overview', icon: LayoutDashboard, href: '' },
  { label: 'Products', icon: Package, href: '/catalog' },
  { label: 'Categories', icon: FolderTree, href: '/categories' },
  { label: 'Orders', icon: ShoppingCart, href: '/orders' },
  { label: 'Store Settings', icon: Settings, href: '/settings' },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { tenant } = useTenant();
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

          return (
            <Link
              key={item.label}
              href={fullPath}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-border/50 p-3">
        <Link
          href="/platform"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all duration-200"
        >
          <LayoutDashboard className="h-4 w-4" />
          Platform Admin
        </Link>
      </div>
    </aside>
  );
}
