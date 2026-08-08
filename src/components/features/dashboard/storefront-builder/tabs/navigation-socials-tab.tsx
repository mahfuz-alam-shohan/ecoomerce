'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StorefrontContentConfig } from '@/lib/db/schemas/tenants.schema';
import { Plus, Trash2, Navigation, Share2, Mail, Phone, MapPin } from 'lucide-react';

interface NavigationSocialsTabProps {
  navigation: StorefrontContentConfig['navigation'];
  footer: StorefrontContentConfig['footer'];
  onNavigationChange: (nav: StorefrontContentConfig['navigation']) => void;
  onFooterChange: (footer: StorefrontContentConfig['footer']) => void;
}

export function NavigationSocialsTab({
  navigation,
  footer,
  onNavigationChange,
  onFooterChange,
}: NavigationSocialsTabProps) {
  function addNavLink() {
    onNavigationChange([...navigation, { label: 'New Link', href: '/catalog' }]);
  }

  function updateNavLink(idx: number, field: 'label' | 'href', value: string) {
    const updated = [...navigation];
    updated[idx] = { ...updated[idx], [field]: value };
    onNavigationChange(updated);
  }

  function removeNavLink(idx: number) {
    onNavigationChange(navigation.filter((_, i) => i !== idx));
  }

  function updateFooterField(field: keyof StorefrontContentConfig['footer'], value: any) {
    onFooterChange({ ...footer, [field]: value });
  }

  function updateSocialLink(network: 'facebook' | 'instagram' | 'twitter', url: string) {
    onFooterChange({
      ...footer,
      socialLinks: { ...footer.socialLinks, [network]: url },
    });
  }

  return (
    <div className="space-y-8">
      {/* Header Navigation Menu */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold tracking-tight">Header Navigation Menu</h3>
            <p className="text-sm text-muted-foreground">
              Configure the clickable menu items displayed in your desktop and mobile top navigation bar.
            </p>
          </div>
          <Button onClick={addNavLink} size="sm" className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" />
            Add Menu Link
          </Button>
        </div>

        <Card className="border-border/60">
          <CardContent className="p-4 space-y-3">
            {navigation.map((link, idx) => (
              <div key={idx} className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/20 p-2.5">
                <Navigation className="h-4 w-4 text-muted-foreground ml-1" />
                <div className="grid flex-1 grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Link Label</Label>
                    <Input
                      value={link.label}
                      onChange={(e) => updateNavLink(idx, 'label', e.target.value)}
                      className="h-8 text-xs font-semibold"
                      placeholder="e.g., Shop Catalog"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Target URL / Path</Label>
                    <Input
                      value={link.href}
                      onChange={(e) => updateNavLink(idx, 'href', e.target.value)}
                      className="h-8 text-xs font-mono"
                      placeholder="e.g., /catalog?category=all"
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeNavLink(idx)}
                  className="h-8 w-8 text-destructive self-end mb-0.5"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <hr className="border-border/60" />

      {/* Footer & Contact Information */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader className="border-b border-border/40 pb-4">
            <CardTitle className="text-base">Footer Contact & About Text</CardTitle>
            <CardDescription className="text-xs">
              Displayed in your footer bottom section across all storefront pages.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Store Bio / About Summary</Label>
              <Input
                value={footer.aboutText}
                onChange={(e) => updateFooterField('aboutText', e.target.value)}
                className="h-9 text-xs"
                placeholder="Leading modern retail platform dedicated to quality..."
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Support Email
              </Label>
              <Input
                value={footer.email || ''}
                onChange={(e) => updateFooterField('email', e.target.value)}
                className="h-9 text-xs"
                placeholder="support@store.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" /> Customer Service Phone
              </Label>
              <Input
                value={footer.phone || ''}
                onChange={(e) => updateFooterField('phone', e.target.value)}
                className="h-9 text-xs"
                placeholder="+1 (800) 555-0199"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> Physical Address
              </Label>
              <Input
                value={footer.address || ''}
                onChange={(e) => updateFooterField('address', e.target.value)}
                className="h-9 text-xs"
                placeholder="100 E-Commerce Ave, CA 90210"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Copyright Line</Label>
              <Input
                value={footer.copyrightText || ''}
                onChange={(e) => updateFooterField('copyrightText', e.target.value)}
                className="h-9 text-xs font-mono text-muted-foreground"
                placeholder="© 2026 Store. All rights reserved."
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card className="border-border/60">
          <CardHeader className="border-b border-border/40 pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Share2 className="h-4 w-4 text-primary" /> Social Media Profiles
            </CardTitle>
            <CardDescription className="text-xs">
              Shoppers can click these icons in your storefront header or footer to follow your brand.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Facebook Page URL</Label>
              <Input
                value={footer.socialLinks?.facebook || ''}
                onChange={(e) => updateSocialLink('facebook', e.target.value)}
                className="h-9 text-xs font-mono"
                placeholder="https://facebook.com/yourbrand"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Instagram Profile URL</Label>
              <Input
                value={footer.socialLinks?.instagram || ''}
                onChange={(e) => updateSocialLink('instagram', e.target.value)}
                className="h-9 text-xs font-mono"
                placeholder="https://instagram.com/yourbrand"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Twitter / X Profile URL</Label>
              <Input
                value={footer.socialLinks?.twitter || ''}
                onChange={(e) => updateSocialLink('twitter', e.target.value)}
                className="h-9 text-xs font-mono"
                placeholder="https://twitter.com/yourbrand"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
