'use client';

import { useEffect } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit';
import { base } from 'wagmi/chains';
import { wagmiConfig } from '@/lib/wagmi-config';
import { ErrorBoundary } from './components/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // FORCE SET TITLE
      document.title = "Table d'Adrian Wellness";
      
      // Suppress WalletConnect/Reown 403 errors in console
      const originalError = console.error;
      console.error = (...args: any[]) => {
        const message = args[0]?.toString() || '';
        // Filter out harmless WalletConnect 403 errors
        if (
          message.includes('[Reown Config]') ||
          message.includes('api.web3modal.org') ||
          (message.includes('HTTP status code: 403') && message.includes('web3modal'))
        ) {
          // Silently ignore - app uses local defaults and works fine
          return;
        }
        originalError.apply(console, args);
      };
      
      // Auto-reload on chunk errors
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
        // Restore original console.error
        console.error = originalError;
      };
    }
  }, []);

  return (
    <ErrorBoundary>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            modalSize="compact"
            initialChain={base}
            appInfo={{
              appName: "Table d'Adrian Wellness",
            }}
            theme={lightTheme({
              accentColor: '#0F4C81',
              borderRadius: 'large',
              fontStack: 'system',
            })}
          >
            {children}
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ErrorBoundary>
  );
}

