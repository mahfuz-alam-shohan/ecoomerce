'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Save, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * StoreSettingsForm — Real form to update tenant theme + store config.
 * Submits to PUT /api/v1/store-settings.
 */

interface StoreSettingsProps {
  tenantId: string;
  themeConfig: {
    templateId?: string;
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
  } | null;
  storeConfig: {
    currency?: string;
    taxRatePercent?: number;
    freeShippingThresholdCents?: number;
    features?: {
      enableCod?: boolean;
      enableBankTransfer?: boolean;
      enableSandboxPay?: boolean;
    };
  } | null;
  templates: { slug: string; name: string; description: string | null }[];
}

export function StoreSettingsForm({
  tenantId,
  themeConfig,
  storeConfig,
  templates,
}: StoreSettingsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Theme config state
  const [templateId, setTemplateId] = useState(themeConfig?.templateId || '');
  const [primaryColor, setPrimaryColor] = useState(themeConfig?.primaryColor || '#3b82f6');
  const [fontFamily, setFontFamily] = useState(themeConfig?.fontFamily || 'Inter');

  // Store config state
  const [currency, setCurrency] = useState(storeConfig?.currency || 'USD');
  const [taxRate, setTaxRate] = useState(storeConfig?.taxRatePercent?.toString() || '5');
  const [freeShipThreshold, setFreeShipThreshold] = useState(
    ((storeConfig?.freeShippingThresholdCents || 10000) / 100).toString()
  );
  const [enableCod, setEnableCod] = useState(storeConfig?.features?.enableCod ?? true);
  const [enableBank, setEnableBank] = useState(storeConfig?.features?.enableBankTransfer ?? true);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/v1/store-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          themeConfig: {
            templateId,
            primaryColor,
            fontFamily,
          },
          storeConfig: {
            currency,
            taxRatePercent: parseFloat(taxRate),
            freeShippingThresholdCents: parseFloat(freeShipThreshold) * 100,
            features: {
              enableCod,
              enableBankTransfer: enableBank,
            },
          },
        }),
      });

      const data = await res.json();

      if (!data.success) {
        toast.error('Update failed', { description: data.error });
        setIsLoading(false);
        return;
      }

      toast.success('Store settings updated');
      router.refresh();
    } catch (err) {
      toast.error('Failed to update settings');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">
      {/* Theme Configuration */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Storefront Template</Label>
            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.slug} value={t.slug}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="primaryColor">Brand Color</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                id="primaryColor"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-10 w-14 cursor-pointer rounded border border-border"
              />
              <Input
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Font Family</Label>
            <Select value={fontFamily} onValueChange={setFontFamily}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Inter">Inter</SelectItem>
                <SelectItem value="Geist">Geist</SelectItem>
                <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                <SelectItem value="Roboto">Roboto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Store Configuration */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Store Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD — US Dollar</SelectItem>
                <SelectItem value="EUR">EUR — Euro</SelectItem>
                <SelectItem value="GBP">GBP — British Pound</SelectItem>
                <SelectItem value="BDT">BDT — Bangladeshi Taka</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="taxRate">Tax Rate (%)</Label>
            <Input
              id="taxRate"
              type="number"
              step="0.1"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="freeShip">Free Shipping Threshold ($)</Label>
            <Input
              id="freeShip"
              type="number"
              step="1"
              value={freeShipThreshold}
              onChange={(e) => setFreeShipThreshold(e.target.value)}
            />
          </div>
          <div className="space-y-3 pt-2">
            <Label>Payment Methods</Label>
            <div className="flex items-center gap-2">
              <Checkbox
                id="cod"
                checked={enableCod}
                onCheckedChange={(v) => setEnableCod(v as boolean)}
              />
              <Label htmlFor="cod" className="font-normal">
                Cash on Delivery (COD)
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="bank"
                checked={enableBank}
                onCheckedChange={(v) => setEnableBank(v as boolean)}
              />
              <Label htmlFor="bank" className="font-normal">
                Bank Transfer
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="lg:col-span-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Settings
        </Button>
      </div>
    </form>
  );
}
