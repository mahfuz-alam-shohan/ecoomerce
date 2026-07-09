import { createAuthClient } from 'better-auth/react';

/**
 * Better-Auth Client Instance
 *
 * Used in React Client Components for sign-in/up forms,
 * session hooks, and sign-out actions.
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
});

export const { signIn, signUp, signOut, useSession } = authClient;
