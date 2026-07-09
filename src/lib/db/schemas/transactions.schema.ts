import { pgTable, uuid, varchar, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { orders } from './orders.schema';

export const transactionStatuses = ['pending', 'approved', 'rejected', 'refunded'] as const;
export type TransactionStatus = (typeof transactionStatuses)[number];

/**
 * Payment Transactions Table — Ledger for all payment events.
 * Tracks every payment attempt, approval, rejection, and refund.
 * Metadata JSONB stores provider-specific data (receipt image URL for bank transfer,
 * Stripe charge ID for Stripe, sandbox simulation result, etc.).
 */
export const transactions = pgTable('payment_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  provider: varchar('provider', { length: 50 }).notNull(), // manual | sandbox | stripe
  providerTransactionId: varchar('provider_transaction_id', { length: 255 }),
  amountInCents: integer('amount_in_cents').notNull(),
  currency: varchar('currency', { length: 10 }).default('USD').notNull(),
  status: varchar('status', { length: 50 }).$type<TransactionStatus>().default('pending').notNull(),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const insertTransactionSchema = createInsertSchema(transactions);
export const selectTransactionSchema = createSelectSchema(transactions);
export type Transaction = z.infer<typeof selectTransactionSchema>;
export type NewTransaction = z.infer<typeof insertTransactionSchema>;
