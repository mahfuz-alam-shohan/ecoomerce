'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';
import { slugify } from '@/lib/utils';

/**
 * ProductFormShell — Real product creation/edit form.
 * Submits to POST /api/v1/products for creation.
 * Submits to PUT /api/v1/products/[id] for updates.
 */

interface ProductFormProps {
  tenantId: string;
  tenantSlug: string;
  categories: { id: string; name: string }[];
  initialData?: {
    id: string;
    title: string;
    handle: string;
    description: string | null;
    categoryId: string | null;
    productType: string;
    status: string;
    tags: unknown;
    seoTitle: string | null;
    seoDescription: string | null;
  };
}

export function ProductFormShell({
  tenantId,
  tenantSlug,
  categories,
  initialData,
}: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;
  const [isLoading, setIsLoading] = useState(false);

  const [title, setTitle] = useState(initialData?.title || '');
  const [handle, setHandle] = useState(initialData?.handle || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [productType, setProductType] = useState(initialData?.productType || 'physical');
  const [status, setStatus] = useState(initialData?.status || 'draft');
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(initialData?.seoDescription || '');

  // Auto-generate handle from title
  function handleTitleChange(value: string) {
    setTitle(value);
    if (!isEditing) {
      setHandle(slugify(value));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      tenantId,
      title,
      handle,
      description: description || null,
      categoryId: categoryId || null,
      productType,
      status,
      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null,
    };

    try {
      const url = isEditing
        ? `/api/v1/products/${initialData.id}`
        : '/api/v1/products';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!data.success) {
        toast.error(isEditing ? 'Update failed' : 'Creation failed', {
          description: data.error,
        });
        setIsLoading(false);
        return;
      }

      toast.success(isEditing ? 'Product updated' : 'Product created');
      router.push(`/dashboard/${tenantSlug}/catalog`);
      router.refresh();
    } catch (err) {
      toast.error('An error occurred');
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Product Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g., iPhone 15 Pro Max"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="handle">URL Handle</Label>
              <Input
                id="handle"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="iphone-15-pro-max"
                required
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Used in the product URL: /product/{handle || 'your-handle'}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your product..."
                rows={4}
                disabled={isLoading}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>SEO</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="seoTitle">SEO Title</Label>
              <Input
                id="seoTitle"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Page title for search engines"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seoDescription">SEO Description</Label>
              <Textarea
                id="seoDescription"
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Meta description for search engines"
                rows={2}
                disabled={isLoading}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Organization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Product Type</Label>
              <Select value={productType} onValueChange={setProductType} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="physical">Physical</SelectItem>
                  <SelectItem value="digital">Digital</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {isEditing ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
}
