
import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth/guards';
import { PlatformSidebar } from '@/components/layout/platform-sidebar';
import { PlatformHeader } from '@/components/layout/platform-header';

/**
 * Platform Layout — Super Admin only.
 * Validates role=super_admin server-side.
 */
export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireRole('super_admin');
  } catch {
    redirect('/sign-in');
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <PlatformSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <PlatformHeader />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
