import { auth, type Session } from '@/lib/auth/server';
import { headers } from 'next/headers';
import type { UserRole } from '@/lib/db/schemas';

/**
 * Auth Guards — Server-Side Session & Role Verification
 *
 * Used by API routes and Server Components to verify
 * the current user's session and enforce role-based access.
 */

/** Get the current authenticated session or null */
export async function getSession(): Promise<Session | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session as Session | null;
}

/** Require an authenticated session — throws if not logged in */
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) {
    throw new AuthError('Authentication required', 401);
  }
  return session;
}

/** Require a specific role — throws if user doesn't have it */
export async function requireRole(...allowedRoles: UserRole[]): Promise<Session> {
  const session = await requireSession();
  const userRole = session.user.role;

  if (!allowedRoles.includes(userRole)) {
    throw new AuthError(
      `Access denied. Required roles: [${allowedRoles.join(', ')}]`,
      403
    );
  }

  return session;
}

/** Require tenant ownership — ensures user belongs to the specified tenant */
export async function requireTenantAccess(tenantId: string): Promise<Session> {
  const session = await requireSession();
  const userTenantId = session.user.tenantId;
  const userRole = session.user.role;

  // Super admins can access any tenant
  if (userRole === 'super_admin') return session;

  if (userTenantId !== tenantId) {
    throw new AuthError('You do not have access to this store', 403);
  }

  return session;
}

/** Custom auth error with HTTP status code */
export class AuthError extends Error {
  public statusCode: number;
  constructor(message: string, statusCode = 401) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
  }
}
