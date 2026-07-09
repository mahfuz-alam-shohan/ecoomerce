'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building2,
  Layers,
  Shield,
} from 'lucide-react';

/**
 * PlatformSidebar — Navigation for the Super Admin platform.
 */

const navItems = [
  { label: 'Overview', icon: LayoutDashboard, href: '/platform' },
  { label: 'Tenants', icon: Building2, href: '/platform/tenants' },
  { label: 'Templates', icon: Layers, href: '/platform/templates' },
];

export function PlatformSidebar() {
  const pathname = usePathname();

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

          return (
            <Link
              key={item.label}
              href={item.href}
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
    </aside>
  );
}
