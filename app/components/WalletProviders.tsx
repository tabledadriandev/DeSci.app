'use client';

import { useState, useEffect, Component, ReactNode, createContext, useContext } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
  },
});

// ==========================================
// SAFE ACCOUNT CONTEXT
// ==========================================
// This context provides account information that works
// regardless of whether wagmi is loaded or not.

export interface SafeAccountData {
  address?: `0x${string}`;
  isConnected: boolean;
  isConnecting: boolean;
  isDisconnected: boolean;
  status: 'connected' | 'disconnected' | 'connecting' | 'reconnecting';
}

interface WalletContextType {
  account: SafeAccountData;
  isWagmiReady: boolean;
  openConnectModal?: () => void;
}

const defaultAccount: SafeAccountData = {
  address: undefined,
  isConnected: false,
  isConnecting: false,
  isDisconnected: true,
  status: 'disconnected',
};

const WalletContext = createContext<WalletContextType>({
  account: defaultAccount,
  isWagmiReady: false,
  openConnectModal: undefined,
});

// Export the hook for pages to use
export function useWallet() {
  return useContext(WalletContext);
}

// ==========================================
// ERROR BOUNDARY
// ==========================================

class WalletErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn('WalletProviders error (using fallback):', error.message);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// ==========================================
// INNER PROVIDER (handles wagmi loading)
// ==========================================

function WalletProvidersInner({ children }: { children: React.ReactNode }) {
  const [WagmiProvider, setWagmiProvider] = useState<any>(null);
  const [RainbowKitProvider, setRainbowKitProvider] = useState<any>(null);
  const [wagmiConfig, setWagmiConfig] = useState<any>(null);
  const [base, setBase] = useState<any>(null);
  const [lightTheme, setLightTheme] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  
  // Account state managed by this provider
  const [account, setAccount] = useState<SafeAccountData>(defaultAccount);
  const [openConnectModal, setOpenConnectModal] = useState<(() => void) | undefined>(undefined);

  useEffect(() => {
    const loadProviders = async () => {
      try {
        const [wagmiModule, rainbowkitModule, configModule, chainsModule] = await Promise.all([
          import('wagmi'),
          import('@rainbow-me/rainbowkit'),
          import('@/lib/wagmi-config'),
          import('wagmi/chains'),
        ]);

        setWagmiProvider(() => wagmiModule.WagmiProvider);
        setRainbowKitProvider(() => rainbowkitModule.RainbowKitProvider);
        setLightTheme(() => rainbowkitModule.lightTheme);
        setWagmiConfig(configModule.wagmiConfig);
        setBase(chainsModule.base);
        setLoaded(true);
      } catch (error) {
        console.warn('Failed to load wallet providers:', error);
        setLoadError(true);
      }
    };

    loadProviders();
  }, []);

  // If loading failed, provide context with defaults
  if (loadError) {
    return (
      <WalletContext.Provider value={{ account: defaultAccount, isWagmiReady: false }}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WalletContext.Provider>
    );
  }

  // If still loading, provide context with defaults
  if (!loaded || !WagmiProvider || !RainbowKitProvider || !wagmiConfig) {
    return (
      <WalletContext.Provider value={{ account: defaultAccount, isWagmiReady: false }}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WalletContext.Provider>
    );
  }

  // Wagmi is loaded - render the full provider stack
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize="compact"
          initialChain={base}
          appInfo={{
            appName: "Table d'Adrian | Longevity & DeSci",
          }}
          theme={lightTheme({
            accentColor: '#82B29A',
            borderRadius: 'large',
            fontStack: 'system',
          })}
        >
          <WagmiAccountSync>
            {children}
          </WagmiAccountSync>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

// ==========================================
// ACCOUNT SYNC (runs inside WagmiProvider)
// ==========================================

function WagmiAccountSync({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<SafeAccountData>(defaultAccount);
  const [openConnectModal, setOpenConnectModal] = useState<(() => void) | undefined>(undefined);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    let unwatch: (() => void) | undefined;

    const syncAccount = async () => {
      try {
        const { getAccount, watchAccount } = await import('@wagmi/core');
        const { wagmiConfig } = await import('@/lib/wagmi-config');
        
        if (!mounted) return;

        // Get initial account
        const initial = getAccount(wagmiConfig);
        setAccount({
          address: initial.address,
          isConnected: initial.isConnected,
          isConnecting: initial.isConnecting,
          isDisconnected: initial.isDisconnected,
          status: initial.status,
        });
        setIsReady(true);

        // Watch for changes
        unwatch = watchAccount(wagmiConfig, {
          onChange: (newAccount) => {
            if (mounted) {
              setAccount({
                address: newAccount.address,
                isConnected: newAccount.isConnected,
                isConnecting: newAccount.isConnecting,
                isDisconnected: newAccount.isDisconnected,
                status: newAccount.status,
              });
            }
          },
        });
      } catch (error) {
        console.warn('Failed to sync account:', error);
        setIsReady(true); // Still mark as ready, just without account
      }
    };

    syncAccount();

    return () => {
      mounted = false;
      if (unwatch) unwatch();
    };
  }, []);

  return (
    <WalletContext.Provider value={{ account, isWagmiReady: isReady, openConnectModal }}>
      {children}
    </WalletContext.Provider>
  );
}

// ==========================================
// MAIN EXPORT
// ==========================================

export default function WalletProviders({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Always provide context, even before mounting
  if (!mounted) {
    return (
      <WalletContext.Provider value={{ account: defaultAccount, isWagmiReady: false }}>
        {children}
      </WalletContext.Provider>
    );
  }

  const fallback = (
    <WalletContext.Provider value={{ account: defaultAccount, isWagmiReady: false }}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WalletContext.Provider>
  );

  return (
    <WalletErrorBoundary fallback={fallback}>
      <WalletProvidersInner>{children}</WalletProvidersInner>
    </WalletErrorBoundary>
  );
}
