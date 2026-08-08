'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ThemeConfig } from '@/lib/db/schemas/tenants.schema';
import { Palette, Layers, Layout, Sun, Moon, Laptop } from 'lucide-react';

interface ThemeStylingTabProps {
  themeConfig: ThemeConfig;
  onChange: (config: ThemeConfig) => void;
  templates: { slug: string; name: string; description: string | null }[];
}

export function ThemeStylingTab({ themeConfig, onChange, templates }: ThemeStylingTabProps) {
  function updateField(field: keyof ThemeConfig, value: any) {
    onChange({ ...themeConfig, [field]: value });
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold tracking-tight">Theme & Brand Styling</h3>
        <p className="text-sm text-muted-foreground">
          Customize how your store template, brand colors, typography, and card layouts render to your shoppers.
        </p>
      </div>

      <Card className="border-border/60">
        <CardHeader className="border-b border-border/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">Storefront Template Selection</CardTitle>
              <CardDescription className="text-xs">
                Choose the architectural layout structure for your public storefront across all pages.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Active Template Engine</Label>
            <Select
              value={themeConfig.templateId}
              onValueChange={(val) => updateField('templateId', val)}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.slug} value={t.slug}>
                    <div className="flex flex-col text-left py-0.5">
                      <span className="font-semibold">{t.name}</span>
                      {t.description && (
                        <span className="text-xs text-muted-foreground">{t.description}</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Brand Colors */}
        <Card className="border-border/60">
          <CardHeader className="border-b border-border/40 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
                <Palette className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Brand Color Palette</CardTitle>
                <CardDescription className="text-xs">
                  Controls your buttons, active badges, and highlight tones across Light & Dark themes.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor" className="text-xs font-medium">
                Primary Brand Color (CTAs & Highlights)
              </Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  id="primaryColor"
                  value={themeConfig.primaryColor || '#3b82f6'}
                  onChange={(e) => updateField('primaryColor', e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded-md border border-border bg-background p-1"
                />
                <Input
                  value={themeConfig.primaryColor || '#3b82f6'}
                  onChange={(e) => updateField('primaryColor', e.target.value)}
                  className="font-mono text-xs flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryColor" className="text-xs font-medium">
                Secondary Color (Headers & Gradients)
              </Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  id="secondaryColor"
                  value={themeConfig.secondaryColor || '#1e40af'}
                  onChange={(e) => updateField('secondaryColor', e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded-md border border-border bg-background p-1"
                />
                <Input
                  value={themeConfig.secondaryColor || '#1e40af'}
                  onChange={(e) => updateField('secondaryColor', e.target.value)}
                  className="font-mono text-xs flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accentColor" className="text-xs font-medium">
                Accent Color (Sale Tags & Progress Bars)
              </Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  id="accentColor"
                  value={themeConfig.accentColor || '#f59e0b'}
                  onChange={(e) => updateField('accentColor', e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded-md border border-border bg-background p-1"
                />
                <Input
                  value={themeConfig.accentColor || '#f59e0b'}
                  onChange={(e) => updateField('accentColor', e.target.value)}
                  className="font-mono text-xs flex-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Layout & Typography */}
        <Card className="border-border/60">
          <CardHeader className="border-b border-border/40 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                <Layout className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Typography & Layout Structure</CardTitle>
                <CardDescription className="text-xs">
                  Fine-tune typography pairing, header style, and UI corner aesthetics.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Typography Font Family</Label>
              <Select
                value={themeConfig.fontFamily || 'Inter'}
                onValueChange={(val) => updateField('fontFamily', val)}
              >
                <SelectTrigger className="h-10 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inter">Inter (Clean Modern Sans)</SelectItem>
                  <SelectItem value="Geist">Geist (High-Precision Tech)</SelectItem>
                  <SelectItem value="Playfair Display">Playfair Display (Luxury Editorial)</SelectItem>
                  <SelectItem value="Roboto">Roboto (Classic Standard)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">Header Navigation Bar Style</Label>
              <Select
                value={themeConfig.headerStyle || 'glass'}
                onValueChange={(val) => updateField('headerStyle', val)}
              >
                <SelectTrigger className="h-10 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="glass">Sticky Glassmorphism Header (Translucent Backdrop Blur)</SelectItem>
                  <SelectItem value="solid">Solid Sticky Header (Opaque Background)</SelectItem>
                  <SelectItem value="minimal">Minimal Centered Header (Clean Utility Border)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Product Card Style</Label>
                <Select
                  value={themeConfig.cardStyle || 'zoom-hover'}
                  onValueChange={(val) => updateField('cardStyle', val)}
                >
                  <SelectTrigger className="h-10 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zoom-hover">Zoom on Hover</SelectItem>
                    <SelectItem value="quick-add">Quick Add Overlay</SelectItem>
                    <SelectItem value="bordered">Clean Bordered Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium">Corner Radius</Label>
                <Select
                  value={themeConfig.borderRadius || '6px'}
                  onValueChange={(val) => updateField('borderRadius', val)}
                >
                  <SelectTrigger className="h-10 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0px">Sharp (0px)</SelectItem>
                    <SelectItem value="6px">Standard Rounded (6px)</SelectItem>
                    <SelectItem value="12px">Friendly Pill (12px)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <Label className="text-xs font-medium">Default Store Theme Mode</Label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => updateField('defaultMode', 'light')}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-medium transition-all ${
                    themeConfig.defaultMode === 'light'
                      ? 'border-primary bg-primary/10 text-primary font-semibold'
                      : 'border-border/60 hover:bg-accent/40'
                  }`}
                >
                  <Sun className="h-3.5 w-3.5" /> Light
                </button>
                <button
                  type="button"
                  onClick={() => updateField('defaultMode', 'dark')}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-medium transition-all ${
                    themeConfig.defaultMode === 'dark'
                      ? 'border-primary bg-primary/10 text-primary font-semibold'
                      : 'border-border/60 hover:bg-accent/40'
                  }`}
                >
                  <Moon className="h-3.5 w-3.5" /> Dark
                </button>
                <button
                  type="button"
                  onClick={() => updateField('defaultMode', 'system')}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-medium transition-all ${
                    !themeConfig.defaultMode || themeConfig.defaultMode === 'system'
                      ? 'border-primary bg-primary/10 text-primary font-semibold'
                      : 'border-border/60 hover:bg-accent/40'
                  }`}
                >
                  <Laptop className="h-3.5 w-3.5" /> System
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
