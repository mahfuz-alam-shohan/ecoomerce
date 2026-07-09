
import { toNextJsHandler } from 'better-auth/next-js';
import { auth } from '@/lib/auth/server';

/**
 * Better-Auth Catch-All API Route
 *
 * Handles all authentication endpoints:
 *   POST /api/auth/sign-in/email
 *   POST /api/auth/sign-up/email
 *   POST /api/auth/sign-out
 *   GET  /api/auth/session
 */
export const { GET, POST } = toNextJsHandler(auth);
