'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PromoAdBanner, TrustBadge } from '@/lib/db/schemas/tenants.schema';
import { Plus, Trash2, Shield, Tag, Sparkles } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PromoTrustTabProps {
  promoAds: PromoAdBanner[];
  trustBadges: TrustBadge[];
  onPromoAdsChange: (ads: PromoAdBanner[]) => void;
  onTrustBadgesChange: (badges: TrustBadge[]) => void;
}

export function PromoTrustTab({
  promoAds,
  trustBadges,
  onPromoAdsChange,
  onTrustBadgesChange,
}: PromoTrustTabProps) {
  function addPromoAd() {
    const newAd: PromoAdBanner = {
      id: `promo-${Date.now()}`,
      title: 'Seasonal Flash Sale',
      description: 'Get an extra 15% off when checking out right now with this voucher code.',
      discountCode: 'FLASH15',
      targetUrl: '/catalog?sale=true',
      position: 'home_top',
      isActive: true,
    };
    onPromoAdsChange([...promoAds, newAd]);
  }

  function updatePromoAd(id: string, field: keyof PromoAdBanner, value: any) {
    onPromoAdsChange(
      promoAds.map((ad) => (ad.id === id ? { ...ad, [field]: value } : ad))
    );
  }

  function removePromoAd(id: string) {
    onPromoAdsChange(promoAds.filter((ad) => ad.id !== id));
  }

  function addTrustBadge() {
    const newBadge: TrustBadge = {
      id: `tb-${Date.now()}`,
      icon: 'shield',
      title: 'Guaranteed Quality',
      description: 'Tested and verified by our rigorous standards.',
    };
    onTrustBadgesChange([...trustBadges, newBadge]);
  }

  function updateTrustBadge(id: string, field: keyof TrustBadge, value: any) {
    onTrustBadgesChange(
      trustBadges.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    );
  }

  function removeTrustBadge(id: string) {
    onTrustBadgesChange(trustBadges.filter((b) => b.id !== id));
  }

  return (
    <div className="space-y-8">
      {/* Promo Ad Banners */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold tracking-tight">Promotional Ad Banners</h3>
            <p className="text-sm text-muted-foreground">
              Embed discount coupon blocks across homepage sections or product listings.
            </p>
          </div>
          <Button onClick={addPromoAd} size="sm" className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" />
            Add Promo Banner
          </Button>
        </div>

        {promoAds.length === 0 ? (
          <Card className="border-dashed border-border/70 py-8 text-center">
            <CardContent className="space-y-2">
              <Tag className="mx-auto h-8 w-8 text-muted-foreground/60" />
              <p className="text-sm font-medium">No Promotional Ad Banners Configured</p>
              <Button onClick={addPromoAd} variant="outline" size="sm" className="mt-2">
                Create First Promo Banner
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {promoAds.map((ad, idx) => (
              <Card key={ad.id} className="border-border/60">
                <CardHeader className="bg-accent/10 py-3 px-4 border-b border-border/40 flex flex-row items-center justify-between">
                  <span className="text-sm font-semibold">Promo Banner #{idx + 1}</span>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={ad.isActive}
                      onCheckedChange={(checked) => updatePromoAd(ad.id, 'isActive', checked)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removePromoAd(ad.id)}
                      className="h-7 w-7 text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Headline</Label>
                    <Input
                      value={ad.title}
                      onChange={(e) => updatePromoAd(ad.id, 'title', e.target.value)}
                      className="h-9 text-xs font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Description</Label>
                    <Input
                      value={ad.description || ''}
                      onChange={(e) => updatePromoAd(ad.id, 'description', e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Discount Coupon Code</Label>
                      <Input
                        value={ad.discountCode || ''}
                        onChange={(e) => updatePromoAd(ad.id, 'discountCode', e.target.value)}
                        className="h-9 text-xs font-mono font-bold uppercase text-primary"
                        placeholder="e.g., WELCOME10"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Placement Position</Label>
                      <Select
                        value={ad.position}
                        onValueChange={(val) => updatePromoAd(ad.id, 'position', val)}
                      >
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="home_top">Homepage Top Section</SelectItem>
                          <SelectItem value="home_middle">Homepage Middle Grid</SelectItem>
                          <SelectItem value="catalog_sidebar">Catalog Sidebar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <hr className="border-border/60" />

      {/* Trust Badges */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold tracking-tight">Customer Trust Badges</h3>
            <p className="text-sm text-muted-foreground">
              Display reassuring badges (SSL security, shipping speed, return policy) across footer and product pages.
            </p>
          </div>
          <Button onClick={addTrustBadge} size="sm" variant="outline" className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" />
            Add Trust Badge
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {trustBadges.map((badge, idx) => (
            <Card key={badge.id} className="border-border/60">
              <CardHeader className="py-2.5 px-3 bg-accent/10 border-b border-border/40 flex flex-row items-center justify-between">
                <span className="text-xs font-semibold">Badge #{idx + 1}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTrustBadge(badge.id)}
                  className="h-6 w-6 text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </CardHeader>
              <CardContent className="p-3 space-y-2.5">
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium">Icon Style</Label>
                  <Select
                    value={badge.icon}
                    onValueChange={(val) => updateTrustBadge(badge.id, 'icon', val)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shield">🛡️ Security Shield</SelectItem>
                      <SelectItem value="truck">🚚 Express Shipping</SelectItem>
                      <SelectItem value="refresh">🔄 Easy Returns</SelectItem>
                      <SelectItem value="support">🎧 24/7 Support</SelectItem>
                      <SelectItem value="star">⭐ Premium Quality</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium">Badge Title</Label>
                  <Input
                    value={badge.title}
                    onChange={(e) => updateTrustBadge(badge.id, 'title', e.target.value)}
                    className="h-8 text-xs font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium">Short Description</Label>
                  <Input
                    value={badge.description || ''}
                    onChange={(e) => updateTrustBadge(badge.id, 'description', e.target.value)}
                    className="h-8 text-[11px]"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
