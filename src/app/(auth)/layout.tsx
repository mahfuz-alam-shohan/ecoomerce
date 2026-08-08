import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/guards';

/**
 * Auth Layout — Centered card layout for sign-in/sign-up pages.
 * Redirects authenticated users away from auth pages.
 */
export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // If already authenticated, redirect to appropriate dashboard
  if (session) {
    const role = session.user.role;
    if (role === 'super_admin') {
      redirect('/platform');
    }
    const tenantSlug = session.user.tenantSlug;
    if (tenantSlug) {
      redirect(`/dashboard/${tenantSlug}`);
    }
    redirect('/');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
