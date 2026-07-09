'use client';

import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth/client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';

/**
 * PlatformHeader — Top bar for the super admin dashboard.
 */
export function PlatformHeader() {
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    toast.success('Signed out');
    router.push('/sign-in');
    router.refresh();
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border/50 bg-background/80 px-6 backdrop-blur-md">
      <h2 className="text-sm font-medium text-muted-foreground">
        Platform Administration
      </h2>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-accent">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                SA
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium hidden sm:inline-block">
              Super Admin
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
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
