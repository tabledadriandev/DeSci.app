'use client';

import { useEffect, useRef, useState } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import WalletProviders from './components/WalletProviders';
import { AuthProvider } from '@/contexts/AuthContext';
import { TutorialProvider } from '@/components/tutorial/TutorialProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const hasSetup = useRef(false);

  useEffect(() => {
    if (hasSetup.current) return;
    hasSetup.current = true;

    setMounted(true);

    if (typeof window !== 'undefined') {
      document.title = "Table d'Adrian | Longevity & DeSci";

      const handleError = (e: ErrorEvent) => {
        if (e.message?.includes('chunk') || e.message?.includes('ChunkLoadError')) {
          e.preventDefault();
          console.warn('Chunk error detected, reloading...', e.message);
          setTimeout(() => window.location.reload(), 2000);
        }
      };

      const handleRejection = (e: PromiseRejectionEvent) => {
        if (e.reason?.message?.includes('chunk') || e.reason?.message?.includes('ChunkLoadError')) {
          e.preventDefault();
          console.warn('Chunk promise rejection, reloading...', e.reason?.message);
          setTimeout(() => window.location.reload(), 2000);
        }
      };

      window.addEventListener('error', handleError);
      window.addEventListener('unhandledrejection', handleRejection);

      return () => {
        window.removeEventListener('error', handleError);
        window.removeEventListener('unhandledrejection', handleRejection);
      };
    }
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <WalletProviders>
          <TutorialProvider>
            {mounted ? children : children}
          </TutorialProvider>
        </WalletProviders>
      </AuthProvider>
    </ErrorBoundary>
  );
}

