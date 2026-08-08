
import { toNextJsHandler } from 'better-auth/next-js';
import { auth } from '@/lib/auth/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const handlers = toNextJsHandler(auth);

export async function GET(request: Request) {
  try {
    return await handlers.GET(request);
  } catch (err: any) {
    console.error('[AUTH GET ERROR]', err);
    return NextResponse.json({ error: err?.message || String(err), stack: err?.stack }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    try {
      // Test DB connection before running better-auth
      await db.query.users.findFirst();
    } catch (dbErr: any) {
      console.error('[DB CHECK FAILED IN AUTH POST]', dbErr);
      return NextResponse.json({ error: 'DB_CONNECTION_ERROR: ' + (dbErr?.message || String(dbErr)), stack: dbErr?.stack }, { status: 500 });
    }

    const res = await handlers.POST(request);
    if (res.status >= 400) {
      const cloned = res.clone();
      const text = await cloned.text();
      console.error(`[AUTH POST FAILED - STATUS ${res.status}]`, text);
      // If it's a 500 with plain "Internal Server Error", let's return JSON with more details
      if (res.status === 500 && text.includes('Internal Server Error')) {
        return NextResponse.json({ error: 'BETTER_AUTH_INTERNAL_ERROR', details: text }, { status: 500 });
      }
    }
    return res;
  } catch (err: any) {
    console.error('[AUTH POST UNHANDLED ERROR]', err);
    return NextResponse.json({ error: err?.message || String(err), stack: err?.stack }, { status: 500 });
  }
}
