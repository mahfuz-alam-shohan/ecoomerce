'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { StorefrontContentConfig, ThemeConfig } from '@/lib/db/schemas/tenants.schema';
import { HeroSlidesTab } from './tabs/hero-slides-tab';
import { AnnouncementBarTab } from './tabs/announcement-bar-tab';
import { PromoTrustTab } from './tabs/promo-trust-tab';
import { NavigationSocialsTab } from './tabs/navigation-socials-tab';
import {
  Save,
  Megaphone,
  Layers,
  ShieldCheck,
  Navigation as NavigationIcon,
  Eye,
  RefreshCw,
} from 'lucide-react';

interface StorefrontBuilderFormProps {
  tenantId: string;
  tenantSlug?: string;
  initialStorefrontConfig: StorefrontContentConfig;
  initialThemeConfig: ThemeConfig;
  templates: { slug: string; name: string; description: string | null }[];
}

export function StorefrontBuilderForm({
  tenantId,
  tenantSlug = 'shenzen-electronics',
  initialStorefrontConfig,
  initialThemeConfig,
  templates,
}: StorefrontBuilderFormProps) {
  const router = useRouter();
  const [storefrontConfig, setStorefrontConfig] = useState<StorefrontContentConfig>(initialStorefrontConfig);
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(initialThemeConfig);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');

  async function handleSave() {
    try {
      setSaving(true);
      const res = await fetch('/api/v1/store-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          storefrontConfig,
          themeConfig,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save storefront configuration');
      }

      toast.success('🎉 Storefront content updated successfully!', {
        description: 'Changes are live on your public shop immediately.',
      });
      router.refresh();
    } catch (error: any) {
      toast.error('Save failed', { description: error?.message });
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setStorefrontConfig(initialStorefrontConfig);
    setThemeConfig(initialThemeConfig);
    toast.info('Reverted unsaved changes to last published state.');
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Clean Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-lg border bg-card text-card-foreground shadow-xs">
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
          <span>Public Shop Preview & Controls</span>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={saving}
            className="gap-2 text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Revert
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/store/${tenantSlug}`, '_blank')}
            className="gap-2 text-xs border-emerald-600/60 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 font-bold"
            title="Open real-time Traditional High-Density Storefront layout"
          >
            <Eye className="h-3.5 w-3.5 text-emerald-600" />
            View Live Store
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            size="sm"
            className="gap-2 text-xs font-bold"
          >
            {saving ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Tabs Layout */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto p-1 bg-muted/60 border border-border/60 rounded-lg">
          <TabsTrigger value="hero" className="gap-2 py-2 text-xs font-medium rounded-md data-[state=active]:bg-background data-[state=active]:shadow-xs">
            <Layers className="h-3.5 w-3.5 text-indigo-500" />
            Hero Slides ({storefrontConfig.heroSlides.length})
          </TabsTrigger>
          <TabsTrigger value="announcement" className="gap-2 py-2 text-xs font-medium rounded-md data-[state=active]:bg-background data-[state=active]:shadow-xs">
            <Megaphone className="h-3.5 w-3.5 text-amber-500" />
            Announcement Bar
          </TabsTrigger>
          <TabsTrigger value="promo-trust" className="gap-2 py-2 text-xs font-medium rounded-md data-[state=active]:bg-background data-[state=active]:shadow-xs">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            Promo & Badges
          </TabsTrigger>
          <TabsTrigger value="navigation" className="gap-2 py-2 text-xs font-medium rounded-md data-[state=active]:bg-background data-[state=active]:shadow-xs">
            <NavigationIcon className="h-3.5 w-3.5 text-blue-500" />
            Nav & Footer
          </TabsTrigger>
        </TabsList>

        {/* Tab 2: Hero Slides */}
        <TabsContent value="hero">
          <HeroSlidesTab
            slides={storefrontConfig.heroSlides}
            onChange={(slides) => setStorefrontConfig({ ...storefrontConfig, heroSlides: slides })}
          />
        </TabsContent>

        {/* Tab 3: Announcement Bar */}
        <TabsContent value="announcement">
          <AnnouncementBarTab
            config={storefrontConfig.announcementBar}
            onChange={(announcementBar) => setStorefrontConfig({ ...storefrontConfig, announcementBar })}
          />
        </TabsContent>

        {/* Tab 4: Promo & Trust Badges */}
        <TabsContent value="promo-trust">
          <PromoTrustTab
            promoAds={storefrontConfig.promoAds}
            trustBadges={storefrontConfig.trustBadges}
            onPromoAdsChange={(promoAds) => setStorefrontConfig({ ...storefrontConfig, promoAds })}
            onTrustBadgesChange={(trustBadges) => setStorefrontConfig({ ...storefrontConfig, trustBadges })}
          />
        </TabsContent>

        {/* Tab 5: Navigation & Socials */}
        <TabsContent value="navigation">
          <NavigationSocialsTab
            navigation={storefrontConfig.navigation}
            footer={storefrontConfig.footer}
            onNavigationChange={(navigation) => setStorefrontConfig({ ...storefrontConfig, navigation })}
            onFooterChange={(footer) => setStorefrontConfig({ ...storefrontConfig, footer })}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
