import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/lib/db/schemas';

/**
 * Database Seeder — Populates demo data for local development
 *
 * Run: npx tsx drizzle/seed.ts
 *
 * Creates:
 *   - 2 Storefront Templates (unlimited template registry)
 *   - 2 Demo Tenants (aura-electronics, velvet-fashion)
 *   - 1 Super Admin user
 *   - 2 Tenant Owner users
 *   - Sample categories, products, and variants per tenant
 */

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/ecom';
const client = postgres(connectionString, { prepare: false });
const db = drizzle(client, { schema });

async function seed() {
  console.log('🌱 Starting database seed...\n');

  // ─── 1. Storefront Templates Registry ──────────────────────
  console.log('📐 Creating storefront templates...');
  const [modernTemplate, boutiqueTemplate] = await db
    .insert(schema.storefrontTemplates)
    .values([
      {
        slug: 'default-modern',
        name: 'Modern Tech',
        description: 'Clean, minimal design optimized for electronics and tech products. Features large hero banners and grid layouts.',
        metadata: {
          category: 'electronics',
          supportedLayouts: ['hero-banner', 'hero-split'],
          previewImages: [],
          features: ['dark-mode', 'product-zoom', 'quick-view'],
        },
      },
      {
        slug: 'luxe-boutique',
        name: 'Luxe Boutique',
        description: 'Elegant, editorial design for fashion and lifestyle brands. Warm tones, serif typography, and lookbook-style layouts.',
        metadata: {
          category: 'fashion',
          supportedLayouts: ['hero-carousel', 'hero-split', 'hero-fullscreen'],
          previewImages: [],
          features: ['lookbook-mode', 'color-swatches', 'size-guide'],
        },
      },
    ])
    .returning();

  console.log(`   ✓ Created templates: "${modernTemplate.slug}", "${boutiqueTemplate.slug}"`);

  // ─── 2. Tenants ────────────────────────────────────────────
  console.log('🏪 Creating demo tenants...');
  const [aura, velvet] = await db
    .insert(schema.tenants)
    .values([
      {
        slug: 'aura-electronics',
        name: 'Aura Electronics',
        themeConfig: {
          templateId: 'default-modern',
          primaryColor: '#3b82f6',
          secondaryColor: '#1e40af',
          fontFamily: 'Inter',
        },
        storeConfig: {
          currency: 'USD',
          taxRatePercent: 5,
          freeShippingThresholdCents: 10000,
          features: { enableCod: true, enableBankTransfer: true, enableSandboxPay: true },
        },
      },
      {
        slug: 'velvet-fashion',
        name: 'Velvet Fashion House',
        themeConfig: {
          templateId: 'luxe-boutique',
          primaryColor: '#be185d',
          secondaryColor: '#9d174d',
          fontFamily: 'Playfair Display',
        },
        storeConfig: {
          currency: 'USD',
          taxRatePercent: 8,
          freeShippingThresholdCents: 15000,
          features: { enableCod: true, enableBankTransfer: true, enableSandboxPay: false },
        },
      },
    ])
    .returning();

  console.log(`   ✓ Created tenants: "${aura.slug}" (ID: ${aura.id}), "${velvet.slug}" (ID: ${velvet.id})`);

  // ─── 3. Users ──────────────────────────────────────────────
  console.log('👤 Creating users...');
  await db.insert(schema.users).values([
    {
      email: 'admin@platform.com',
      name: 'Platform Super Admin',
      role: 'super_admin',
      passwordHash: '$placeholder_hash_admin',
    },
    {
      tenantId: aura.id,
      email: 'owner@aura-electronics.com',
      name: 'Aura Store Owner',
      role: 'tenant_owner',
      passwordHash: '$placeholder_hash_aura',
    },
    {
      tenantId: velvet.id,
      email: 'owner@velvet-fashion.com',
      name: 'Velvet Store Owner',
      role: 'tenant_owner',
      passwordHash: '$placeholder_hash_velvet',
    },
  ]);
  console.log('   ✓ Created 3 users (super_admin + 2 tenant_owners)');

  // ─── 4. Categories ────────────────────────────────────────
  console.log('📂 Creating categories...');
  const [phoneCat, laptopCat] = await db
    .insert(schema.categories)
    .values([
      { tenantId: aura.id, name: 'Smartphones', slug: 'smartphones', sortOrder: 1 },
      { tenantId: aura.id, name: 'Laptops', slug: 'laptops', sortOrder: 2 },
      { tenantId: velvet.id, name: 'Dresses', slug: 'dresses', sortOrder: 1 },
      { tenantId: velvet.id, name: 'Accessories', slug: 'accessories', sortOrder: 2 },
    ])
    .returning();
  console.log('   ✓ Created 4 categories (2 per tenant)');

  // ─── 5. Products ──────────────────────────────────────────
  console.log('📦 Creating products...');
  const [iphone, macbook, silkDress, leatherBag] = await db
    .insert(schema.products)
    .values([
      {
        tenantId: aura.id,
        categoryId: phoneCat.id,
        title: 'iPhone 15 Pro Max',
        handle: 'iphone-15-pro-max',
        description: 'The most powerful iPhone ever. Titanium design, A17 Pro chip, and 48MP camera system.',
        productType: 'physical',
        images: ['https://placehold.co/600x600/3b82f6/white?text=iPhone+15'],
        dynamicSpecs: { chipset: 'A17 Pro', display: '6.7" OLED', battery: '4422 mAh', storage: '256GB' },
        tags: ['apple', 'smartphone', 'flagship'],
        seoTitle: 'iPhone 15 Pro Max - Aura Electronics',
        seoDescription: 'Buy iPhone 15 Pro Max at Aura Electronics. Free shipping on orders over $100.',
        status: 'active',
      },
      {
        tenantId: aura.id,
        categoryId: laptopCat.id,
        title: 'MacBook Pro 16" M3 Max',
        handle: 'macbook-pro-16-m3-max',
        description: 'Supercharged by M3 Max. Up to 128GB unified memory. 22-hour battery life.',
        productType: 'physical',
        images: ['https://placehold.co/600x600/1e40af/white?text=MacBook+Pro'],
        dynamicSpecs: { chip: 'M3 Max', ram: '36GB', storage: '1TB SSD', display: '16.2" Liquid Retina XDR' },
        tags: ['apple', 'laptop', 'pro'],
        status: 'active',
      },
      {
        tenantId: velvet.id,
        categoryId: phoneCat.id, // Using first category for now
        title: 'Midnight Silk Maxi Dress',
        handle: 'midnight-silk-maxi-dress',
        description: 'Luxurious pure silk maxi dress with flowing silhouette. Perfect for evening occasions.',
        productType: 'physical',
        images: ['https://placehold.co/600x600/be185d/white?text=Silk+Dress'],
        dynamicSpecs: { material: '100% Silk', care: 'Dry clean only', origin: 'Italy' },
        tags: ['dress', 'silk', 'luxury', 'evening'],
        status: 'active',
      },
      {
        tenantId: velvet.id,
        categoryId: laptopCat.id,
        title: 'Italian Leather Crossbody Bag',
        handle: 'italian-leather-crossbody-bag',
        description: 'Handcrafted Italian leather crossbody bag with gold-tone hardware.',
        productType: 'physical',
        images: ['https://placehold.co/600x600/9d174d/white?text=Leather+Bag'],
        dynamicSpecs: { material: 'Full-grain leather', hardware: 'Gold-tone brass', dimensions: '22x15x7cm' },
        tags: ['bag', 'leather', 'accessory'],
        status: 'active',
      },
    ])
    .returning();
  console.log('   ✓ Created 4 products (2 per tenant)');

  // ─── 6. Variants ──────────────────────────────────────────
  console.log('🎨 Creating product variants...');
  await db.insert(schema.variants).values([
    // iPhone variants
    { productId: iphone.id, sku: 'IP15PM-256-NAT', title: 'Natural Titanium / 256GB', options: { color: 'Natural Titanium', storage: '256GB' }, priceInCents: 119900, stockQuantity: 50 },
    { productId: iphone.id, sku: 'IP15PM-256-BLU', title: 'Blue Titanium / 256GB', options: { color: 'Blue Titanium', storage: '256GB' }, priceInCents: 119900, stockQuantity: 35 },
    { productId: iphone.id, sku: 'IP15PM-512-BLK', title: 'Black Titanium / 512GB', options: { color: 'Black Titanium', storage: '512GB' }, priceInCents: 139900, stockQuantity: 20 },
    // MacBook variants
    { productId: macbook.id, sku: 'MBP16-36-1T', title: '36GB / 1TB SSD', options: { ram: '36GB', storage: '1TB' }, priceInCents: 349900, stockQuantity: 15 },
    { productId: macbook.id, sku: 'MBP16-64-2T', title: '64GB / 2TB SSD', options: { ram: '64GB', storage: '2TB' }, priceInCents: 449900, stockQuantity: 8 },
    // Silk Dress variants
    { productId: silkDress.id, sku: 'SDK-SILK-S', title: 'Small', options: { size: 'S' }, priceInCents: 34900, stockQuantity: 12 },
    { productId: silkDress.id, sku: 'SDK-SILK-M', title: 'Medium', options: { size: 'M' }, priceInCents: 34900, stockQuantity: 18 },
    { productId: silkDress.id, sku: 'SDK-SILK-L', title: 'Large', options: { size: 'L' }, priceInCents: 34900, stockQuantity: 10 },
    // Leather Bag variants
    { productId: leatherBag.id, sku: 'LB-BLK', title: 'Black', options: { color: 'Black' }, priceInCents: 28900, stockQuantity: 25 },
    { productId: leatherBag.id, sku: 'LB-TAN', title: 'Tan', options: { color: 'Tan' }, priceInCents: 28900, stockQuantity: 20 },
  ]);
  console.log('   ✓ Created 10 variants across 4 products');

  // ─── Done ─────────────────────────────────────────────────
  console.log('\n✅ Seed complete! Database is populated with demo data.');
  console.log('\n📊 Summary:');
  console.log('   • 2 Storefront Templates (default-modern, luxe-boutique)');
  console.log('   • 2 Tenants (aura-electronics, velvet-fashion)');
  console.log('   • 3 Users (1 super_admin + 2 tenant_owners)');
  console.log('   • 4 Categories');
  console.log('   • 4 Products');
  console.log('   • 10 Variants');

  await client.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
