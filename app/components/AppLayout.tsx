'use client';

import { useState, useEffect } from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import { MenuProvider } from './MenuContext';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ProtectedRoute from '@/components/ui/ProtectedRoute';

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-bg-primary">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-bg-primary">
        <Navigation />
        <main className="flex-1 w-full">
          <div className="w-full">
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <MenuProvider>
      <ThemeProvider>
        <ToastProvider>
          <AppLayoutContent>{children}</AppLayoutContent>
        </ToastProvider>
      </ThemeProvider>
    </MenuProvider>
  );
}
