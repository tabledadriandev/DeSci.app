'use client';

import { useState, useEffect, Component, ReactNode } from 'react';
import { useWallet } from '@/app/components/WalletProviders';
import AnimatedButton from './AnimatedButton';

// Error boundary for RainbowKit
class ConnectButtonErrorBoundary extends Component<
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

  componentDidCatch() {
    // Silently handle errors
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Inner component that loads RainbowKit ConnectButton
function RainbowKitConnectButton() {
  const [ConnectButton, setConnectButton] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    
    const load = async () => {
      try {
        const rainbowkit = await import('@rainbow-me/rainbowkit');
        if (mounted) {
          setConnectButton(() => rainbowkit.ConnectButton);
        }
      } catch (error) {
        console.warn('Failed to load RainbowKit ConnectButton');
      }
    };
    
    load();
    return () => { mounted = false; };
  }, []);

  if (!ConnectButton) {
    return (
      <AnimatedButton variant="primary" disabled>
        Loading...
      </AnimatedButton>
    );
  }

  return <ConnectButton />;
}

// Fallback button when RainbowKit isn't ready
function FallbackConnectButton() {
  return (
    <AnimatedButton variant="primary" disabled>
      Connect Wallet
    </AnimatedButton>
  );
}

/**
 * Safe wrapper for RainbowKit's ConnectButton
 * Handles cases where the provider isn't ready yet
 */
export default function SafeConnectButton() {
  const { isWagmiReady } = useWallet();

  if (!isWagmiReady) {
    return <FallbackConnectButton />;
  }

  return (
    <ConnectButtonErrorBoundary fallback={<FallbackConnectButton />}>
      <RainbowKitConnectButton />
    </ConnectButtonErrorBoundary>
  );
}


