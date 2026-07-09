import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schemas';

// Get database URL from environment variables or fallback to a local placeholder
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/ecom';

// Disable prefetch as it is not supported for "Transaction" pool mode in Neon / Supabase PgBouncer
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });
