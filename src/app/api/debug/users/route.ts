import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole, AuthError } from '@/lib/auth/guards';

export async function GET() {
  try {
    await requireRole('super_admin');

    const allUsers = await db.query.users.findMany({
      columns: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
        createdAt: true,
      },
    });
    const allTenants = await db.query.tenants.findMany({
      columns: {
        id: true,
        name: true,
        slug: true,
      },
    });
    return NextResponse.json({ success: true, users: allUsers, tenants: allTenants });
  } catch (err: any) {
    if (err instanceof AuthError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}
