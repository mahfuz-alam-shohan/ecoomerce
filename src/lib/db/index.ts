import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schemas';

type DrizzleInstance = ReturnType<typeof drizzle<typeof schema>>;

let _globalDb: DrizzleInstance | null = null;
let _globalPool: Pool | null = null;
let _globalCachedUrl: string | null = null;

interface CachedDb {
  db: DrizzleInstance;
  pool: Pool;
  created: number;
}

// WeakMap keyed strictly on the request store (`cfContext`) with a 2000ms TTL.
// Using node-postgres (`pg`) directly over Hyperdrive (`nodejs_compat`) resolves
// postgres.js's internal stream read buffer desynchronization (`Error 1101`).
const requestDbs = new WeakMap<object, CachedDb>();

function getDb(): DrizzleInstance {
  let connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/ecom';
  let cfContext: any = null;

  try {
    const { getCloudflareContext } = require('@opennextjs/cloudflare');
    cfContext = getCloudflareContext();
    const env = cfContext?.env;

    if (env?.HYPERDRIVE?.connectionString) {
      connectionString = env.HYPERDRIVE.connectionString;
    } else if (env?.DATABASE_URL) {
      connectionString = env.DATABASE_URL;
    }
  } catch {}

  const requestKey = cfContext && typeof cfContext === 'object' ? cfContext : null;

  // If we are inside an active Cloudflare request lifecycle:
  if (requestKey) {
    const cached = requestDbs.get(requestKey);
    if (cached && Date.now() - cached.created < 2000) {
      return cached.db;
    }

    const pool = new Pool({
      connectionString,
      max: 1,
      idleTimeoutMillis: 1000,
      connectionTimeoutMillis: 5000,
    });

    const dbInstance = drizzle(pool, { schema });
    requestDbs.set(requestKey, { db: dbInstance, pool, created: Date.now() });
    return dbInstance;
  }

  // Fallback for non-request environments (e.g. Next.js build step or local scripts)
  if (!_globalDb || _globalCachedUrl !== connectionString) {
    if (_globalPool) {
      try { _globalPool.end(); } catch {}
    }
    _globalCachedUrl = connectionString;
    _globalPool = new Pool({
      connectionString,
      max: 1,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
    });
    _globalDb = drizzle(_globalPool, { schema });
  }
  return _globalDb;
}

export const db = new Proxy({} as DrizzleInstance, {
  get(_target, prop) {
    const instance = getDb();
    const value = instance[prop as keyof DrizzleInstance];
    if (typeof value === 'function') {
      return (...args: any[]) => {
        const currentInstance = getDb();
        return (currentInstance[prop as keyof DrizzleInstance] as any).apply(currentInstance, args);
      };
    }
    return value;
  },
  has(_target, prop) {
    const instance = getDb();
    return prop in instance;
  },
  ownKeys(_target) {
    const instance = getDb();
    return Reflect.ownKeys(instance);
  },
  getOwnPropertyDescriptor(_target, prop) {
    const instance = getDb();
    return Reflect.getOwnPropertyDescriptor(instance, prop);
  },
});
