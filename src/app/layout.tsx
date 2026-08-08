import type { Metadata } from 'next';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { AppProgressAndMotionProvider } from '@/components/providers/motion-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'ECom Platform — Multi-Tenant E-Commerce',
  description:
    'Enterprise-grade multi-tenant e-commerce management platform. Manage stores, products, orders, and storefronts from a single centralized dashboard.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="font-sans"
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppProgressAndMotionProvider>
            <TooltipProvider delayDuration={0}>
              {children}
            </TooltipProvider>
            <Toaster richColors position="top-right" />
          </AppProgressAndMotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
