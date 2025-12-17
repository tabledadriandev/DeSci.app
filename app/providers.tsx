'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider } from '@/contexts/AuthContext';

// Dynamically import wallet components to avoid SSR issues with MetaMask SDK
const WalletProviders = dynamic(
  () => import('./components/WalletProviders'),
  { 
    ssr: false,
    loading: () => null
  }
);

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const hasSetup = useRef(false);

  useEffect(() => {
    if (hasSetup.current) return;
    hasSetup.current = true;
    
    setMounted(true);
    
    if (typeof window !== 'undefined') {
      // FORCE SET TITLE
      document.title = "Table d'Adrian | Longevity & DeSci";
      
      // Auto-reload on chunk errors only
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
        {mounted ? (
          <WalletProviders>{children}</WalletProviders>
        ) : (
          <>{children}</>
        )}
      </AuthProvider>
    </ErrorBoundary>
  );
}
