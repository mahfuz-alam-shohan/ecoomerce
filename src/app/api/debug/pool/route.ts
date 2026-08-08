import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tenants, users } from '@/lib/db/schemas';
import { count } from 'drizzle-orm';
import { requireRole, AuthError } from '@/lib/auth/guards';

export async function GET() {
  const logs: string[] = [];
  try {
    await requireRole('super_admin');

    const start = Date.now();
    logs.push(`[${Date.now() - start}ms] Query 1: users.findFirst`);
    await db.query.users.findFirst();

    logs.push(`[${Date.now() - start}ms] Query 2: session.findFirst`);
    await db.query.session.findFirst();

    logs.push(`[${Date.now() - start}ms] Query 3: tenants.findFirst`);
    await db.query.tenants.findFirst();

    logs.push(`[${Date.now() - start}ms] Query 4: select count from tenants`);
    await db.select({ total: count() }).from(tenants);

    logs.push(`[${Date.now() - start}ms] Query 5: select count from users`);
    await db.select({ total: count() }).from(users);

    logs.push(`[${Date.now() - start}ms] All 5 sequential queries completed successfully!`);
    return NextResponse.json({ success: true, logs });
  } catch (err: any) {
    if (err instanceof AuthError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ success: false, logs, error: err?.message || String(err), stack: err?.stack }, { status: 500 });
  }
}
