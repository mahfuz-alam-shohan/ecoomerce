'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useTenant } from '@/lib/providers/tenant-provider';

/**
 * DashboardBreadcrumbs — Auto-generated from URL path segments.
 * Converts slugs to human-readable labels.
 */

const labelMap: Record<string, string> = {
  dashboard: 'Dashboard',
  catalog: 'Products',
  categories: 'Categories',
  orders: 'Orders',
  settings: 'Store Settings',
  new: 'Create New',
};

export function DashboardBreadcrumbs() {
  const pathname = usePathname();
  const { tenant } = useTenant();

  const segments = pathname
    .split('/')
    .filter(Boolean)
    .filter((s) => s !== tenant.slug); // Remove tenant slug from breadcrumbs

  return (
    <nav className="flex items-center gap-1.5 text-sm">
      {segments.map((segment, index) => {
        const href = '/' + segments.slice(0, index + 1).join('/');
        // Re-insert tenant slug for proper link
        const fullHref = href.replace('/dashboard/', `/dashboard/${tenant.slug}/`);
        const isLast = index === segments.length - 1;
        const label = labelMap[segment] || segment.replace(/-/g, ' ');

        return (
          <span key={href} className="flex items-center gap-1.5">
            {index > 0 && (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            {isLast ? (
              <span className="font-medium text-foreground capitalize">
                {label}
              </span>
            ) : (
              <Link
                href={fullHref}
                className="text-muted-foreground hover:text-foreground transition-colors capitalize"
              >
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
