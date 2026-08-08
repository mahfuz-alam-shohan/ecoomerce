
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/guards';
import { PlatformSidebar } from '@/components/layout/platform-sidebar';
import { PlatformHeader } from '@/components/layout/platform-header';
import { PageTransition } from '@/components/ui/page-transition';

/**
 * Platform Layout — Super Admin only.
 * Validates role=super_admin server-side.
 */
export const dynamic = 'force-dynamic';

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect('/sign-in');
  }
  if (session.user.role !== 'super_admin') {
    redirect('/');
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <PlatformSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <PlatformHeader />
        <main className="flex-1 overflow-y-auto p-6 flex flex-col">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
