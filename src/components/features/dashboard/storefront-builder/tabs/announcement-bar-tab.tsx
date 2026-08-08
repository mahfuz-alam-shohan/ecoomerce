'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { StorefrontContentConfig } from '@/lib/db/schemas/tenants.schema';
import { Megaphone, ExternalLink } from 'lucide-react';

interface AnnouncementBarTabProps {
  config: StorefrontContentConfig['announcementBar'];
  onChange: (config: StorefrontContentConfig['announcementBar']) => void;
}

export function AnnouncementBarTab({ config, onChange }: AnnouncementBarTabProps) {
  function updateField(field: keyof StorefrontContentConfig['announcementBar'], value: any) {
    onChange({ ...config, [field]: value });
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold tracking-tight">Top Announcement Bar</h3>
        <p className="text-sm text-muted-foreground">
          Display a sticky promotional message across the very top of your storefront across all pages.
        </p>
      </div>

      <Card className="border-border/60">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Megaphone className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">Enable Announcement Bar</CardTitle>
              <CardDescription className="text-xs">
                When enabled, shoppers will see this banner above your header navigation.
              </CardDescription>
            </div>
          </div>
          <Switch
            checked={config.enabled}
            onCheckedChange={(checked) => updateField('enabled', checked)}
          />
        </CardHeader>

        <CardContent className="space-y-4 pt-2 border-t border-border/40">
          <div className="space-y-2">
            <Label htmlFor="announcementText" className="text-sm font-medium">
              Announcement Message
            </Label>
            <Input
              id="announcementText"
              placeholder="🎉 Free Express Shipping on Orders Over $100 | Easy 30-Day Returns"
              value={config.text}
              onChange={(e) => updateField('text', e.target.value)}
              disabled={!config.enabled}
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkUrl" className="text-sm font-medium">
              Optional Click Link URL
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="linkUrl"
                placeholder="/catalog?sale=true"
                value={config.linkUrl || ''}
                onChange={(e) => updateField('linkUrl', e.target.value)}
                disabled={!config.enabled}
                className="font-mono text-xs h-10"
              />
              <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 pt-2">
            <div className="space-y-2">
              <Label htmlFor="bgColor" className="text-sm font-medium">
                Banner Background Color
              </Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  id="bgColor"
                  value={config.backgroundColor || '#1e293b'}
                  onChange={(e) => updateField('backgroundColor', e.target.value)}
                  disabled={!config.enabled}
                  className="h-10 w-14 cursor-pointer rounded-md border border-border bg-background p-1"
                />
                <Input
                  value={config.backgroundColor || '#1e293b'}
                  onChange={(e) => updateField('backgroundColor', e.target.value)}
                  disabled={!config.enabled}
                  className="font-mono text-xs flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="textColor" className="text-sm font-medium">
                Text Color
              </Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  id="textColor"
                  value={config.textColor || '#ffffff'}
                  onChange={(e) => updateField('textColor', e.target.value)}
                  disabled={!config.enabled}
                  className="h-10 w-14 cursor-pointer rounded-md border border-border bg-background p-1"
                />
                <Input
                  value={config.textColor || '#ffffff'}
                  onChange={(e) => updateField('textColor', e.target.value)}
                  disabled={!config.enabled}
                  className="font-mono text-xs flex-1"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-border/80 bg-muted/40 p-4">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
              Live Preview
            </Label>
            {config.enabled ? (
              <div
                style={{ backgroundColor: config.backgroundColor || '#1e293b', color: config.textColor || '#ffffff' }}
                className="w-full py-2.5 px-4 text-center text-xs sm:text-sm font-medium rounded shadow-inner flex items-center justify-center gap-2 transition-colors"
              >
                <span>{config.text || 'Your announcement banner text will appear right here.'}</span>
                {config.linkUrl && <span className="underline opacity-80 text-[11px]">(Clickable)</span>}
              </div>
            ) : (
              <div className="w-full py-3 text-center text-xs text-muted-foreground italic bg-muted/60 rounded border border-dashed border-border/60">
                Announcement bar is currently disabled and hidden from shoppers.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
