/**
 * Platform Setup Script — Creates Super Admin Account & Demo Data directly in DB.
 *
 * Usage: npx tsx scripts/setup.ts
 */

import 'dotenv/config';
import { db } from '../src/lib/db';
import { users, tenants, storefrontTemplates, categories, products, variants, storeSettings } from '../src/lib/db/schemas';
import { eq } from 'drizzle-orm';
import { auth } from '../src/lib/auth/server';

async function setup() {
  console.log('🚀 ECom Platform Setup (Direct Database & Auth API)\n');

  const adminEmail = 'mahfuz.alam.shohan@gmail.com';
  const adminPassword = '159020302';
  const adminName = 'Mahfuz Alam Shohan';

  // ─── Step 1: Create or Update Super Admin Account ────────────────────
  console.log(`👤 Checking super admin account: ${adminEmail}...`);

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, adminEmail),
  });

  if (existingUser) {
    console.log('   ℹ️  User already exists. Updating role to `super_admin`...');
    await db.update(users).set({ role: 'super_admin', isActive: true }).where(eq(users.email, adminEmail));
    console.log('   ✅ Updated existing account to `super_admin`');
  } else {
    console.log('   🔨 Creating new account via Better-Auth Server API...');
    try {
      await auth.api.signUpEmail({
        body: {
          email: adminEmail,
          password: adminPassword,
          name: adminName,
        },
      });

      await db.update(users).set({ role: 'super_admin', isActive: true }).where(eq(users.email, adminEmail));
      console.log('   ✅ Successfully created super admin account!');
    } catch (err) {
      console.error('   ❌ Error creating user:', err);
      process.exit(1);
    }
  }

  // ─── Step 2: Ensure Default Templates Exist ──────────────────────
  console.log('\n🎨 Verifying storefront templates...');
  const templatesCount = await db.select().from(storefrontTemplates);
  if (templatesCount.length === 0) {
    await db.insert(storefrontTemplates).values([
      {
        slug: 'default-modern',
        name: 'Modern Clean',
        description: 'A sleek, minimalist design perfect for electronics and gadgets.',
        isActive: true,
        isPremium: false,
        metadata: {
          category: 'electronics',
          supportedLayouts: ['hero-banner'],
          previewImages: [],
          features: ['Hero Slider', 'Quick View'],
        },
      },
      {
        slug: 'default-fashion',
        name: 'Boutique Elegance',
        description: 'High-contrast luxury layout tailored for apparel and jewelry.',
        isActive: true,
        isPremium: false,
        metadata: {
          category: 'fashion',
          supportedLayouts: ['hero-banner'],
          previewImages: [],
          features: ['Lookbook', 'Instagram Feed'],
        },
      },
    ]);
    console.log('   ✅ Inserted default storefront templates.');
  } else {
    console.log(`   ℹ️  Templates registry already populated (${templatesCount.length} templates).`);
  }

  // ─── Step 3: Ensure Demo Tenant & Tenant Owner Account Exist ──────
  console.log('\n🏬 Checking demo store & tenant owner account...');
  const demoTenantSlug = 'shenzen-electronics';
  const ownerEmail = 'owner@shenzen.com';
  const ownerPassword = 'store123456';
  const ownerName = 'Shenzen Store Manager';

  let tenant = await db.query.tenants.findFirst({
    where: eq(tenants.slug, demoTenantSlug),
  });

  if (!tenant) {
    const [inserted] = await db
      .insert(tenants)
      .values({
        name: 'Shenzen Electronics Hub',
        slug: demoTenantSlug,
        status: 'active',
        storeConfig: {
          currency: 'USD',
          taxRatePercent: 5,
          freeShippingThresholdCents: 10000,
          features: { enableCod: true, enableBankTransfer: true, enableSandboxPay: true },
        },
      })
      .returning();
    tenant = inserted;
    console.log('   ✅ Created demo store (`shenzen-electronics`)');
  } else {
    console.log('   ℹ️  Demo store (`shenzen-electronics`) already exists.');
  }

  const existingOwner = await db.query.users.findFirst({
    where: eq(users.email, ownerEmail),
  });

  if (existingOwner) {
    console.log('   ℹ️  Tenant owner already exists. Ensuring role `tenant_owner` and correct tenantId...');
    await db.update(users).set({ role: 'tenant_owner', tenantId: tenant.id, isActive: true }).where(eq(users.email, ownerEmail));
    console.log('   ✅ Updated existing owner account.');
  } else {
    console.log('   🔨 Creating new tenant owner account...');
    try {
      await auth.api.signUpEmail({
        body: {
          email: ownerEmail,
          password: ownerPassword,
          name: ownerName,
        },
      });
      await db.update(users).set({ role: 'tenant_owner', tenantId: tenant.id, isActive: true }).where(eq(users.email, ownerEmail));
      console.log('   ✅ Successfully created demo tenant owner account!');
    } catch (err) {
      console.error('   ❌ Error creating tenant owner:', err);
    }
  }

  console.log('\n=============================================');
  console.log('🎉 PLATFORM SETUP COMPLETE!');
  console.log('=============================================');
  console.log('📋 Admin Login Credentials (`super_admin` -> /platform):');
  console.log(`   Email:    ${adminEmail}`);
  console.log(`   Password: ${adminPassword}`);
  console.log('   Role:     super_admin');
  console.log('---------------------------------------------');
  console.log('🏬 Demo Store Owner Credentials (`tenant_owner` -> /dashboard/shenzen-electronics):');
  console.log(`   Email:    ${ownerEmail}`);
  console.log(`   Password: ${ownerPassword}`);
  console.log('   Role:     tenant_owner');
  console.log('\n🌐 Open your browser at: http://localhost:3000/sign-in');
  console.log('=============================================\n');
  process.exit(0);
}

setup().catch((e) => {
  console.error(e);
  process.exit(1);
});
