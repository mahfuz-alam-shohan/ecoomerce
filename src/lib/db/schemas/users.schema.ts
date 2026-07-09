import { pgTable, uuid, text, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { tenants } from './tenants.schema';

export const userRoles = ['super_admin', 'tenant_owner', 'tenant_staff', 'customer'] as const;
export type UserRole = (typeof userRoles)[number];

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }).notNull(),
  passwordHash: varchar('password_hash', { length: 512 }),
  name: varchar('name', { length: 255 }).notNull(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: varchar('image', { length: 512 }),
  role: varchar('role', { length: 50 }).$type<UserRole>().default('customer').notNull(),
  avatarUrl: varchar('avatar_url', { length: 512 }),
  isActive: boolean('is_active').default(true).notNull(),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export type User = z.infer<typeof selectUserSchema>;
export type NewUser = z.infer<typeof insertUserSchema>;
