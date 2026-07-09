'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';

interface CreateTenantModalProps {
  trigger?: React.ReactNode;
}

/**
 * Create Tenant Modal — Super Admin Only
 * Allows creating a new tenant (store) with name, slug, currency, and template selection.
 */
export function CreateTenantModal({ trigger }: CreateTenantModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [customDomain, setCustomDomain] = useState('');

  /** Auto-generate slug from store name */
  function handleNameChange(value: string) {
    setName(value);
    const generated = value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    setSlug(generated);
  }

  function resetForm() {
    setName('');
    setSlug('');
    setCurrency('USD');
    setCustomDomain('');
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !slug.trim()) {
      setError('Store name and slug are required');
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/v1/tenant/manage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            slug: slug.trim(),
            customDomain: customDomain.trim() || null,
            storeConfig: {
              currency,
              taxRatePercent: 5,
              freeShippingThresholdCents: 10000,
              features: {
                enableCod: true,
                enableBankTransfer: true,
                enableSandboxPay: true,
              },
            },
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || data.message || 'Failed to create tenant');
          return;
        }

        setOpen(false);
        resetForm();
        router.refresh();
      } catch {
        setError('Network error. Please try again.');
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button id="create-tenant-btn" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Store
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Store</DialogTitle>
            <DialogDescription>
              Set up a new tenant store on the platform. The store owner can configure products, orders, and branding from their own dashboard.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-6">
            {/* Store Name */}
            <div className="grid gap-2">
              <Label htmlFor="tenant-name">Store Name</Label>
              <Input
                id="tenant-name"
                placeholder="e.g. TechZone Electronics"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                autoFocus
              />
            </div>

            {/* Slug */}
            <div className="grid gap-2">
              <Label htmlFor="tenant-slug">Store Slug</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="tenant-slug"
                  placeholder="e.g. techzone-electronics"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  required
                  className="font-mono text-sm"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                This becomes the store URL: <span className="font-mono text-foreground">{slug || 'store-slug'}.yourdomain.com</span>
              </p>
            </div>

            {/* Custom Domain */}
            <div className="grid gap-2">
              <Label htmlFor="tenant-domain">Custom Domain <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input
                id="tenant-domain"
                placeholder="e.g. www.techzone.com"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
              />
            </div>

            {/* Currency */}
            <div className="grid gap-2">
              <Label htmlFor="tenant-currency">Default Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="tenant-currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD — US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR — Euro</SelectItem>
                  <SelectItem value="GBP">GBP — British Pound</SelectItem>
                  <SelectItem value="BDT">BDT — Bangladeshi Taka</SelectItem>
                  <SelectItem value="INR">INR — Indian Rupee</SelectItem>
                  <SelectItem value="JPY">JPY — Japanese Yen</SelectItem>
                  <SelectItem value="AUD">AUD — Australian Dollar</SelectItem>
                  <SelectItem value="CAD">CAD — Canadian Dollar</SelectItem>
                  <SelectItem value="SGD">SGD — Singapore Dollar</SelectItem>
                  <SelectItem value="MYR">MYR — Malaysian Ringgit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Error message */}
            {error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create Store
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
