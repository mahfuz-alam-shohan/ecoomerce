'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { HeroSlide } from '@/lib/db/schemas/tenants.schema';
import { Plus, Trash2, GripVertical, Image as ImageIcon, Sparkles } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface HeroSlidesTabProps {
  slides: HeroSlide[];
  onChange: (slides: HeroSlide[]) => void;
}

export function HeroSlidesTab({ slides, onChange }: HeroSlidesTabProps) {
  function addSlide() {
    const newSlide: HeroSlide = {
      id: `slide-${Date.now()}`,
      title: 'New Featured Collection',
      subtitle: 'Highlight your best products, seasonal sales, or brand story here.',
      buttonText: 'Shop Now',
      buttonUrl: '/catalog',
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop',
      badgeText: '⚡ LIMITED TIME',
      isActive: true,
    };
    onChange([...slides, newSlide]);
  }

  function updateSlide(id: string, field: keyof HeroSlide, value: any) {
    onChange(
      slides.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  }

  function removeSlide(id: string) {
    onChange(slides.filter((s) => s.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Hero Carousel Slides</h3>
          <p className="text-sm text-muted-foreground">
            Manage the primary promotional banners displayed at the top of your homepage (`/home`).
          </p>
        </div>
        <Button onClick={addSlide} size="sm" className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" />
          Add New Slide
        </Button>
      </div>

      {slides.length === 0 ? (
        <Card className="border-dashed border-border/70 py-12 text-center">
          <CardContent className="space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/30 text-primary">
              <ImageIcon className="h-6 w-6" />
            </div>
            <p className="font-medium">No Hero Slides Active</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Add at least one hero banner slide to showcase seasonal collections and deals to your shoppers.
            </p>
            <Button onClick={addSlide} variant="outline" size="sm">
              Create First Slide
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {slides.map((slide, index) => (
            <Card key={slide.id} className="overflow-hidden border-border/60 transition-all hover:border-border">
              <CardHeader className="bg-accent/10 py-3 px-4 border-b border-border/40 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground/60 cursor-grab" />
                  <span className="text-sm font-semibold">Slide #{index + 1}</span>
                  {slide.badgeText && (
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary">
                      {slide.badgeText}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span>{slide.isActive ? 'Active' : 'Hidden'}</span>
                    <Switch
                      checked={slide.isActive}
                      onCheckedChange={(checked) => updateSlide(slide.id, 'isActive', checked)}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSlide(slide.id)}
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    title="Remove slide"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 grid gap-4 sm:grid-cols-2">
                <div className="space-y-3 sm:col-span-1">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Promo Badge Text</Label>
                    <Input
                      placeholder="e.g., ⚡ NEW COLLECTION"
                      value={slide.badgeText || ''}
                      onChange={(e) => updateSlide(slide.id, 'badgeText', e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Main Heading Title</Label>
                    <Input
                      placeholder="e.g., Next-Gen Audio Experience"
                      value={slide.title}
                      onChange={(e) => updateSlide(slide.id, 'title', e.target.value)}
                      className="h-9 text-xs font-semibold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Subtitle / Description</Label>
                    <Input
                      placeholder="e.g., Immerse yourself in crystal-clear sound with our latest arrivals."
                      value={slide.subtitle}
                      onChange={(e) => updateSlide(slide.id, 'subtitle', e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Button Label</Label>
                      <Input
                        placeholder="Shop Now"
                        value={slide.buttonText}
                        onChange={(e) => updateSlide(slide.id, 'buttonText', e.target.value)}
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Target URL Path</Label>
                      <Input
                        placeholder="/catalog?category=all"
                        value={slide.buttonUrl}
                        onChange={(e) => updateSlide(slide.id, 'buttonUrl', e.target.value)}
                        className="h-9 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 sm:col-span-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Banner Image URL (High-Res HTTP/HTTPS)</Label>
                    <Input
                      placeholder="https://images.unsplash.com/..."
                      value={slide.imageUrl}
                      onChange={(e) => updateSlide(slide.id, 'imageUrl', e.target.value)}
                      className="h-9 text-xs font-mono"
                    />
                  </div>
                  <div className="relative mt-2 aspect-[21/9] w-full overflow-hidden rounded-lg border border-border/60 bg-muted/30">
                    {slide.imageUrl ? (
                      <img
                        src={slide.imageUrl}
                        alt={slide.title}
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                        No image preview available
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-3 text-white">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                        {slide.badgeText || 'PROMO'}
                      </span>
                      <h4 className="text-sm font-bold line-clamp-1">{slide.title || 'Slide Title'}</h4>
                      <p className="text-[11px] text-white/80 line-clamp-1">{slide.subtitle || 'Subtitle preview'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
