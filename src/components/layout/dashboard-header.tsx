'use client';

import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth/client';
import { useTenant } from '@/lib/providers/tenant-provider';
import { DashboardBreadcrumbs } from './dashboard-breadcrumbs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User } from 'lucide-react';
import { toast } from 'sonner';

/**
 * DashboardHeader — Top bar with breadcrumbs and user avatar dropdown.
 * Sign-out triggers real Better-Auth session destruction.
 */
export function DashboardHeader() {
  const router = useRouter();
  const { session } = useTenant();
  const user = session.user;
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  async function handleSignOut() {
    await authClient.signOut();
    toast.success('Signed out');
    router.push('/sign-in');
    router.refresh();
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border/50 bg-background/80 px-6 backdrop-blur-md">
      <DashboardBreadcrumbs />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-accent">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-foreground hidden sm:inline-block">
              {user.name}
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
