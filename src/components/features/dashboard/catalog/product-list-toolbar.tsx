'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';

/**
 * ProductListToolbar — Search input + "Add Product" button.
 */
export function ProductListToolbar({ tenantSlug }: { tenantSlug: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          className="pl-9"
        />
      </div>
      <Button asChild>
        <Link href={`/dashboard/${tenantSlug}/catalog/new`}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Link>
      </Button>
    </div>
  );
}
