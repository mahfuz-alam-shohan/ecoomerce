'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QuantumSpinner } from '@/components/ui/loading-motions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  ArrowRight,
  ArrowLeft,
  Check,
  Store,
  ShieldCheck,
  Settings,
  Sparkles,
  Globe,
  Lock,
  Mail,
  User,
  AlertCircle,
  X,
} from 'lucide-react';

interface CreateTenantModalProps {
  trigger?: React.ReactNode;
}

/**
 * Create Tenant Modal — Super Admin Only
 * Linear/Stripe-grade multi-step wizard UI with pristine spacing, alignment, and typography.
 */
export function CreateTenantModal({ trigger }: CreateTenantModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [customDomain, setCustomDomain] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');

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
    setOwnerName('');
    setOwnerEmail('');
    setOwnerPassword('');
    setError(null);
    setStep(1);
  }

  function handleNextStep() {
    setError(null);
    if (step === 1) {
      if (!name.trim() || !slug.trim()) {
        setError('Store Name and URL Slug are required to continue.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (ownerEmail.trim() && !ownerPassword.trim()) {
        setError('Please enter an initial password for the owner email address.');
        return;
      }
      setStep(3);
    }
  }

  function handlePrevStep() {
    setError(null);
    if (step > 1) {
      setStep((step - 1) as 1 | 2);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !slug.trim()) {
      setError('Store Name and URL Slug are required.');
      setStep(1);
      return;
    }

    if (ownerEmail.trim() && !ownerPassword.trim()) {
      setError('Password is required when specifying an owner email.');
      setStep(2);
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
            ownerName: ownerName.trim() || undefined,
            ownerEmail: ownerEmail.trim() || undefined,
            ownerPassword: ownerPassword.trim() || undefined,
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
          setError(data.error || data.message || 'Failed to create tenant.');
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
          <Button id="create-tenant-btn" className="gap-2.5 h-10 px-4 rounded-xl font-semibold shadow-md transition-all hover:scale-[1.02]">
            <Plus className="h-4 w-4" />
            Add Store
          </Button>
        )}
      </DialogTrigger>
      {/* 
        Pass showCloseButton={false} so we can place our custom DialogClose with absolute precision
        and ensure `Step X of 3` badge has ample right padding (`pr-16`).
      */}
      <DialogContent showCloseButton={false} className="sm:max-w-[620px] p-0 overflow-hidden rounded-3xl border border-border/80 bg-card shadow-2xl relative">
        <DialogClose className="absolute top-5 right-5 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-muted/80 text-muted-foreground transition-all hover:bg-muted hover:text-foreground shadow-sm hover:scale-105">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
        <DialogTitle className="sr-only">Create New Store Wizard</DialogTitle>
        <form onSubmit={handleSubmit} className="flex flex-col">
          
          {/* Top Header & Wizard Pills Bar */}
          <div className="bg-muted/30 border-b border-border/60 px-7 pt-6 pb-5">
            <div className="flex items-center justify-between pr-16 mb-5">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Sparkles className="h-4 w-4" />
                </span>
                <span className="text-sm font-bold tracking-tight text-foreground">
                  New Store Setup Wizard
                </span>
              </div>
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary ring-1 ring-inset ring-primary/20">
                Step {step} of 3
              </span>
            </div>

            {/* Step Pills Bar */}
            <div className="grid grid-cols-3 gap-2.5">
              {/* Step 1 Pill */}
              <div
                onClick={() => { if (step > 1) setStep(1); }}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                  step === 1
                    ? 'bg-card text-foreground shadow-sm border border-border ring-1 ring-primary/30'
                    : step > 1
                    ? 'bg-primary/15 text-primary cursor-pointer hover:bg-primary/20'
                    : 'bg-muted/50 text-muted-foreground opacity-60'
                }`}
              >
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                  step === 1 ? 'bg-primary text-primary-foreground' : step > 1 ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/20 text-muted-foreground'
                }`}>
                  {step > 1 ? <Check className="h-3 w-3 stroke-[3]" /> : '1'}
                </span>
                <span className="truncate">Identity & URL</span>
              </div>

              {/* Step 2 Pill */}
              <div
                onClick={() => { if (step > 2) setStep(2); }}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                  step === 2
                    ? 'bg-card text-foreground shadow-sm border border-border ring-1 ring-primary/30'
                    : step > 2
                    ? 'bg-primary/15 text-primary cursor-pointer hover:bg-primary/20'
                    : 'bg-muted/50 text-muted-foreground opacity-60'
                }`}
              >
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                  step === 2 ? 'bg-primary text-primary-foreground' : step > 2 ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/20 text-muted-foreground'
                }`}>
                  {step > 2 ? <Check className="h-3 w-3 stroke-[3]" /> : '2'}
                </span>
                <span className="truncate">Owner Login</span>
              </div>

              {/* Step 3 Pill */}
              <div
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                  step === 3
                    ? 'bg-card text-foreground shadow-sm border border-border ring-1 ring-primary/30'
                    : 'bg-muted/50 text-muted-foreground opacity-60'
                }`}
              >
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                  step === 3 ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/20 text-muted-foreground'
                }`}>
                  3
                </span>
                <span className="truncate">Configuration</span>
              </div>
            </div>
          </div>

          {/* Modal Main Content Area */}
          <div className="px-7 py-7 min-h-[320px] flex flex-col justify-between bg-card">
            
            {/* SCREEN 1: Store Identity & URL Slug */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-3 duration-300">
                <div className="border-b border-border/50 pb-4 space-y-1">
                  <h3 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2.5">
                    <Store className="h-5 w-5 text-primary" />
                    Store Identity & Web Address
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Set up your store name and URL slug. Each tenant store operates independently with its own branded storefront and dashboard.
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="tenant-name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Store Name
                      </Label>
                      <span className="text-[11px] font-semibold text-destructive">* Required</span>
                    </div>
                    <Input
                      id="tenant-name"
                      placeholder="e.g. Dhaka Gadgets & Apparel"
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      required
                      autoFocus
                      className="h-11 rounded-xl border-border/70 bg-background px-3.5 text-sm font-medium shadow-sm transition-all focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="tenant-slug" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Store URL Slug
                      </Label>
                      <span className="text-[11px] font-semibold text-destructive">* Required</span>
                    </div>
                    <div className="flex h-11 items-center rounded-xl border border-border/70 bg-muted/40 px-3.5 shadow-sm transition-all focus-within:border-primary focus-within:bg-background focus-within:ring-2 focus-within:ring-primary/20">
                      <span className="text-xs font-mono text-muted-foreground select-none pr-1.5 flex items-center gap-1">
                        <Globe className="h-3.5 w-3.5 text-muted-foreground/70" />
                        /store/
                      </span>
                      <input
                        id="tenant-slug"
                        type="text"
                        placeholder="dhaka-gadgets"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        required
                        className="w-full border-0 bg-transparent p-0 text-sm font-mono font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground pl-0.5">
                      Storefront link: <span className="font-mono font-medium text-foreground">ecom.mahfuz-alam-shohan.workers.dev/store/{slug || 'your-slug'}</span>
                    </p>
                  </div>

                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="tenant-domain" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Custom Domain
                      </Label>
                      <span className="text-[11px] font-medium text-muted-foreground">Optional</span>
                    </div>
                    <Input
                      id="tenant-domain"
                      placeholder="e.g. www.dhakagadgets.com"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      className="h-11 rounded-xl border-border/70 bg-background px-3.5 text-sm font-medium shadow-sm transition-all focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 2: Owner Login Credentials */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-3 duration-300">
                <div className="border-b border-border/50 pb-4 space-y-1">
                  <h3 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2.5">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    Store Owner Login Credentials
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Create an isolated login account (`owner role`) for this store merchant so they can manage their inventory and orders directly at <span className="font-mono text-foreground font-semibold">/sign-in</span>.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="owner-name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Owner Full Name
                      </Label>
                      <span className="text-[11px] font-medium text-muted-foreground">Optional</span>
                    </div>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground/70" />
                      <Input
                        id="owner-name"
                        placeholder="e.g. Tanvir Ahmed"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        autoFocus
                        className="h-11 rounded-xl border-border/70 bg-background pl-10 pr-3.5 text-sm font-medium shadow-sm transition-all focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="owner-email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Login Email Address
                      </Label>
                      <span className="text-[11px] font-medium text-muted-foreground">Optional</span>
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground/70" />
                      <Input
                        id="owner-email"
                        type="email"
                        placeholder="e.g. tanvir@dhakagadgets.com"
                        value={ownerEmail}
                        onChange={(e) => setOwnerEmail(e.target.value)}
                        className="h-11 rounded-xl border-border/70 bg-background pl-10 pr-3.5 text-sm font-medium shadow-sm transition-all focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="owner-password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Initial Login Password
                      </Label>
                      <span className="text-[11px] font-semibold text-muted-foreground">
                        {ownerEmail ? 'Required if email is set' : 'Optional'}
                      </span>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground/70" />
                      <Input
                        id="owner-password"
                        type="text"
                        placeholder="e.g. WelcomeStore#2026"
                        value={ownerPassword}
                        onChange={(e) => setOwnerPassword(e.target.value)}
                        className="h-11 rounded-xl border-border/70 bg-background pl-10 pr-3.5 text-sm font-mono font-medium shadow-sm transition-all focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 3: Currency & Confirmation */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-3 duration-300">
                <div className="border-b border-border/50 pb-4 space-y-1">
                  <h3 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2.5">
                    <Settings className="h-5 w-5 text-primary" />
                    Store Currency & Launch Review
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Select the store's operating currency and review all configuration settings before completing onboarding.
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="tenant-currency" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Default Store Currency
                    </Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger id="tenant-currency" className="h-11 rounded-xl border-border/70 bg-background px-3.5 text-sm font-medium shadow-sm">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border/80 shadow-xl">
                        <SelectItem value="USD" className="rounded-lg">USD ($) — United States Dollar</SelectItem>
                        <SelectItem value="EUR" className="rounded-lg">EUR (€) — Euro</SelectItem>
                        <SelectItem value="GBP" className="rounded-lg">GBP (£) — British Pound</SelectItem>
                        <SelectItem value="BDT" className="rounded-lg font-semibold text-primary">BDT (৳) — Bangladeshi Taka</SelectItem>
                        <SelectItem value="INR" className="rounded-lg">INR (₹) — Indian Rupee</SelectItem>
                        <SelectItem value="JPY" className="rounded-lg">JPY (¥) — Japanese Yen</SelectItem>
                        <SelectItem value="AUD" className="rounded-lg">AUD (A$) — Australian Dollar</SelectItem>
                        <SelectItem value="CAD" className="rounded-lg">CAD (C$) — Canadian Dollar</SelectItem>
                        <SelectItem value="SGD" className="rounded-lg">SGD (S$) — Singapore Dollar</SelectItem>
                        <SelectItem value="MYR" className="rounded-lg">MYR (RM) — Malaysian Ringgit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Summary Card */}
                  <div className="rounded-2xl bg-muted/40 border border-border/70 p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                        <Store className="h-3.5 w-3.5 text-primary" />
                        {name || 'New Store'}
                      </span>
                      <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary font-mono">
                        {currency}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-y-2.5 text-xs">
                      <div>
                        <span className="text-muted-foreground block text-[11px]">URL Slug</span>
                        <span className="font-mono font-medium text-foreground">/store/{slug || 'slug'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Custom Domain</span>
                        <span className="font-medium text-foreground">{customDomain || 'None'}</span>
                      </div>
                      <div className="col-span-2 pt-1 border-t border-border/40">
                        <span className="text-muted-foreground block text-[11px]">Owner Login ID (Email)</span>
                        <span className="font-medium text-foreground flex items-center gap-1.5">
                          {ownerEmail ? (
                            <>
                              <span className="text-primary font-semibold">{ownerEmail}</span>
                              {ownerName && <span className="text-muted-foreground">({ownerName})</span>}
                            </>
                          ) : (
                            <span className="text-muted-foreground italic">No initial merchant email (Super Admin only)</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message Alert */}
            {error && (
              <div className="mt-5 rounded-xl bg-destructive/10 border border-destructive/30 p-3.5 text-xs text-destructive flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 font-bold" />
                <div className="font-medium leading-relaxed">{error}</div>
              </div>
            )}
          </div>

          {/* Footer Navigation Buttons */}
          <DialogFooter className="px-7 py-4 bg-muted/30 border-t border-border/60 flex flex-row items-center justify-between sm:justify-between gap-4">
            <div>
              {step > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevStep}
                  disabled={isPending}
                  className="gap-2 rounded-xl h-10 px-4 border-border/80 text-foreground font-medium hover:bg-muted"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                  disabled={isPending}
                  className="rounded-xl h-10 px-4 text-muted-foreground hover:text-foreground font-medium"
                >
                  Cancel
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {step < 3 ? (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="gap-2 rounded-xl h-10 px-6 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all hover:scale-[1.02]"
                >
                  Next Step
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isPending}
                  className="gap-2 rounded-xl h-10 px-6 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
                >
                  {isPending ? (
                    <div className="flex items-center gap-2.5">
                      <QuantumSpinner size="sm" />
                      <span>Creating & Provisioning Store...</span>
                    </div>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Launch Store & Account
                    </>
                  )}
                </Button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
