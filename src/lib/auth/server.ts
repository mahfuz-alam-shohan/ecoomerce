import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/lib/db';

/**
 * Better-Auth Server Instance
 *
 * Serverless-ready authentication engine.
 * Uses Drizzle ORM adapter for Postgres session/user storage.
 *
 * Better-Auth auto-creates its own tables: user, session, account, verification.
 * We extend the `user` table with custom fields: role, tenantId.
 */
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes cache
    },
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'customer',
        input: true,
      },
      tenantId: {
        type: 'string',
        required: false,
        input: true,
      },
      tenantSlug: {
        type: 'string',
        required: false,
        input: true,
      },
    },
  },
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ],
});

export type Session = typeof auth.$Infer.Session;
