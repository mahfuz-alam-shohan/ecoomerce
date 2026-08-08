import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { requireRole, AuthError } from '@/lib/auth/guards';

export async function GET() {
  const logs: string[] = [];
  try {
    await requireRole('super_admin');

    logs.push('Step 1: getting headers...');
    const reqHeaders = await headers();
    logs.push(`Step 2: headers obtained. Cookie length: ${reqHeaders.get('cookie')?.length || 0}`);

    logs.push('Step 3: testing direct db query...');
    const dbTest = await db.query.users.findFirst();
    logs.push(`Step 4: db query finished. User: ${dbTest?.email || 'none'}`);

    logs.push('Step 5: calling auth.api.getSession...');
    const session = await auth.api.getSession({
      headers: reqHeaders,
    });
    logs.push(`Step 6: getSession finished. User: ${session?.user?.email || 'none'}`);

    return NextResponse.json({ success: true, logs, session });
  } catch (err: any) {
    if (err instanceof AuthError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ success: false, logs, error: err?.message || String(err), stack: err?.stack }, { status: 500 });
  }
}
