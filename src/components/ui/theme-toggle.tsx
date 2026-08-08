'use client';

import * as React from 'react';
import { Moon, Sun, Laptop, Palette } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl border border-border/40 bg-background/50 backdrop-blur-sm hover:bg-accent hover:text-accent-foreground">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 rounded-xl border-border/50 shadow-xl backdrop-blur-md">
        <DropdownMenuLabel className="text-xs font-semibold uppercase text-muted-foreground">
          Color Mode
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={() => setTheme('light')} className="cursor-pointer gap-2 rounded-lg">
          <Sun className="h-4 w-4 text-amber-500" />
          <span>Light Mode</span>
          {theme === 'light' && <span className="ml-auto text-xs font-bold text-primary">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')} className="cursor-pointer gap-2 rounded-lg">
          <Moon className="h-4 w-4 text-blue-400" />
          <span>Dark Mode</span>
          {theme === 'dark' && <span className="ml-auto text-xs font-bold text-primary">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')} className="cursor-pointer gap-2 rounded-lg">
          <Laptop className="h-4 w-4 text-muted-foreground" />
          <span>System</span>
          {theme === 'system' && <span className="ml-auto text-xs font-bold text-primary">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
