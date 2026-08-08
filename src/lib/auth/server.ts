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
import type { BetterAuthOptions } from 'better-auth';
import * as schema from '@/lib/db/schemas';

const authOptions = {
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.users,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  logger: {
    level: 'debug',
    disabled: false,
  },
  onAPIError: {
    throw: false,
    onError: (error: any) => {
      console.error('[Better-Auth API Error Triggered]', error);
    },
  },
  secret: process.env.BETTER_AUTH_SECRET || 'fallback_secret_for_build_only_32_bytes_long_secret_key',
  baseURL:
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://ecom.mahfuz-alam-shohan.workers.dev',
  trustedOrigins: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'https://ecom.mahfuz-alam-shohan.workers.dev',
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.BETTER_AUTH_URL,
  ].filter(Boolean) as string[],
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
        type: 'string' as const,
        defaultValue: 'customer',
        input: true,
      },
      tenantId: {
        type: 'string' as const,
        required: false,
        input: true,
      },
      tenantSlug: {
        type: 'string' as const,
        required: false,
        input: true,
      },
    },
  },
} satisfies BetterAuthOptions;

type AuthType = ReturnType<typeof betterAuth<typeof authOptions>>;

let _auth: AuthType | null = null;

function getAuth(): AuthType {
  if (!_auth) {
    try {
      const { getCloudflareContext } = require('@opennextjs/cloudflare');
      const env = getCloudflareContext().env;
      if (env) {
        if (env.DATABASE_URL && !process.env.DATABASE_URL) process.env.DATABASE_URL = env.DATABASE_URL;
        if (env.BETTER_AUTH_SECRET && !process.env.BETTER_AUTH_SECRET) process.env.BETTER_AUTH_SECRET = env.BETTER_AUTH_SECRET;
        if (env.BETTER_AUTH_URL && !process.env.BETTER_AUTH_URL) process.env.BETTER_AUTH_URL = env.BETTER_AUTH_URL;
        if (env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL) process.env.NEXT_PUBLIC_APP_URL = env.NEXT_PUBLIC_APP_URL;
      }
    } catch {}

    _auth = betterAuth(authOptions);
  }
  return _auth;
}

const authProxyTarget = function (...args: any[]) {
  const currentInstance = getAuth();
  if (typeof currentInstance === 'function') {
    return (currentInstance as any)(...args);
  }
  if (currentInstance && typeof (currentInstance as any).handler === 'function') {
    return (currentInstance as any).handler(...args);
  }
  throw new Error('Auth instance is not callable');
};

export const auth = new Proxy(authProxyTarget as unknown as AuthType, {
  get(_target, prop) {
    const instance = getAuth();
    const value = instance[prop as keyof AuthType];
    if (typeof value === 'function') {
      return (...args: any[]) => {
        const currentInstance = getAuth();
        return (currentInstance[prop as keyof AuthType] as any).apply(currentInstance, args);
      };
    }
    return value;
  },
  has(_target, prop) {
    const instance = getAuth();
    return prop in instance || prop === 'handler' || prop === 'api';
  },
  ownKeys(_target) {
    const instance = getAuth();
    return Reflect.ownKeys(instance);
  },
  getOwnPropertyDescriptor(_target, prop) {
    const instance = getAuth();
    return Reflect.getOwnPropertyDescriptor(instance, prop);
  },
});

import type { UserRole } from '@/lib/db/schemas/users.schema';

export type AuthUser = typeof auth.$Infer.Session.user & {
  role: UserRole;
  tenantId?: string | null;
  tenantSlug?: string | null;
};

export type Session = Omit<typeof auth.$Infer.Session, 'user'> & {
  user: AuthUser;
};
