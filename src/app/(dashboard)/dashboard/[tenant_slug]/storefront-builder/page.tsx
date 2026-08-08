import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { tenants, storefrontTemplates } from '@/lib/db/schemas';
import { redirect } from 'next/navigation';
import { StorefrontBuilderForm } from '@/components/features/dashboard/storefront-builder/storefront-builder-form';

/**
 * Headless Storefront Builder Page — Server Component
 * Fetches current tenant's storefrontConfig, themeConfig, and available templates.
 */
export default async function StorefrontBuilderPage({
  params,
}: {
  params: Promise<{ tenant_slug: string }>;
}) {
  const { tenant_slug } = await params;

  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.slug, tenant_slug),
  });

  if (!tenant) redirect('/sign-in');

  const templates = await db.query.storefrontTemplates.findMany({
    where: eq(storefrontTemplates.isActive, true),
  });

  // Ensure default fallback structures if missing
  const defaultStorefrontConfig = tenant.storefrontConfig || {
    announcementBar: {
      enabled: true,
      text: '🎉 Free Express Shipping on Orders Over $100 | Easy 30-Day Returns',
      linkUrl: '/catalog',
      backgroundColor: '#1e293b',
      textColor: '#ffffff',
    },
    heroSlides: [
      {
        id: 'slide-1',
        title: 'Next-Generation Collection',
        subtitle: 'Engineered for precision, speed, and premium daily utility.',
        buttonText: 'Explore Catalog',
        buttonUrl: '/catalog',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop',
        badgeText: '⚡ NEW ARRIVALS',
        isActive: true,
      },
    ],
    promoAds: [],
    navigation: [
      { label: 'Home', href: '/' },
      { label: 'Shop Catalog', href: '/catalog' },
      { label: 'Categories', href: '/categories' },
    ],
    footer: {
      aboutText: 'Leading modern retail platform dedicated to quality products and fast, dependable global shipping.',
      email: 'support@store.com',
      phone: '+1 (800) 555-0199',
      address: '100 E-Commerce Ave, Suite 400, Retail City, CA 90210',
      socialLinks: {},
      copyrightText: '© 2026 Store. All rights reserved.',
    },
    trustBadges: [],
  };

  const defaultThemeConfig = tenant.themeConfig || {
    templateId: 'default-modern',
    primaryColor: '#3b82f6',
    secondaryColor: '#1e40af',
    accentColor: '#f59e0b',
    fontFamily: 'Inter',
    headerStyle: 'glass',
    cardStyle: 'zoom-hover',
    borderRadius: '6px',
    defaultMode: 'system',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Storefront Content</h1>
          <p className="text-muted-foreground mt-1">
            Manage your store&apos;s announcement banner, hero slides, navigation links, and footer
          </p>
        </div>
      </div>

      <StorefrontBuilderForm
        tenantId={tenant.id}
        tenantSlug={tenant.slug}
        initialStorefrontConfig={defaultStorefrontConfig as any}
        initialThemeConfig={defaultThemeConfig as any}
        templates={templates.map((t) => ({
          slug: t.slug,
          name: t.name,
          description: t.description,
        }))}
      />
    </div>
  );
}
