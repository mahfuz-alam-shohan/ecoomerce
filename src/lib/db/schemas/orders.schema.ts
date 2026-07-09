import { pgTable, uuid, text, varchar, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { tenants } from './tenants.schema';
import { users } from './users.schema';

export const orderStatuses = [
  'pending',
  'payment_verified',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
] as const;
export type OrderStatus = (typeof orderStatuses)[number];

export const paymentMethods = ['cod', 'bank_transfer', 'mobile_money', 'sandbox', 'stripe'] as const;
export type PaymentMethod = (typeof paymentMethods)[number];

export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

/**
 * Orders Table — Order header with tenant-scoped lifecycle state machine.
 * Supports multiple payment methods (COD, Bank Transfer, Sandbox, future Stripe).
 * Addresses stored as JSONB for international flexibility.
 */
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  customerId: text('customer_id').references(() => users.id, { onDelete: 'set null' }),
  orderNumber: varchar('order_number', { length: 50 }).notNull().unique(),
  status: varchar('status', { length: 50 }).$type<OrderStatus>().default('pending').notNull(),
  customerEmail: varchar('customer_email', { length: 255 }).notNull(),
  customerName: varchar('customer_name', { length: 255 }),
  paymentMethod: varchar('payment_method', { length: 50 }).$type<PaymentMethod>().notNull(),
  subtotalInCents: integer('subtotal_in_cents').notNull(),
  taxInCents: integer('tax_in_cents').default(0).notNull(),
  shippingInCents: integer('shipping_in_cents').default(0).notNull(),
  discountInCents: integer('discount_in_cents').default(0).notNull(),
  totalAmountInCents: integer('total_amount_in_cents').notNull(),
  currency: varchar('currency', { length: 10 }).default('USD').notNull(),
  shippingAddress: jsonb('shipping_address').$type<ShippingAddress>(),
  billingAddress: jsonb('billing_address').$type<ShippingAddress>(),
  notes: varchar('notes', { length: 1000 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const insertOrderSchema = createInsertSchema(orders);
export const selectOrderSchema = createSelectSchema(orders);
export type Order = z.infer<typeof selectOrderSchema>;
export type NewOrder = z.infer<typeof insertOrderSchema>;
