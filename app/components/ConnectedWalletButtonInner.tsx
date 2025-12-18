'use client';

import { useAccount } from '@/hooks/useAccount';
import { useWallet } from '@/app/components/WalletProviders';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { useState, useEffect, Component, ReactNode } from 'react';

// Error boundary to catch RainbowKit errors
class RainbowKitErrorBoundary extends Component<
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
    // Silently handle RainbowKit errors
    if (!error.message.includes('useConnectModal')) {
      console.warn('RainbowKit error:', error.message);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Inner component that uses the hook (only rendered when ready)
function WalletButtonWithModal() {
  const { address, isConnected } = useAccount();
  
  // This will be dynamically loaded
  const [ModalOpener, setModalOpener] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const load = async () => {
      try {
        // Dynamically import a component that uses useConnectModal
        const { ConnectButton } = await import('@rainbow-me/rainbowkit');
        if (mounted) {
          setModalOpener(() => ConnectButton);
        }
      } catch (error) {
        console.warn('Failed to load RainbowKit ConnectButton:', error);
      }
    };
    
    load();
    return () => { mounted = false; };
  }, []);

  if (ModalOpener) {
    // Use RainbowKit's built-in ConnectButton which handles everything
    return <ModalOpener.Custom>
      {({ account, chain, openConnectModal, mounted: rkMounted }) => {
        const ready = rkMounted;
        const connected = ready && account && chain;

        return (
          <AnimatedButton
            onClick={connected ? undefined : openConnectModal}
            variant={connected ? 'secondary' : 'primary'}
            size="sm"
            className="text-sm px-4 py-2"
          >
            {connected
              ? `${account.address.slice(0, 4)}...${account.address.slice(-4)}`
              : 'Connect Wallet'}
          </AnimatedButton>
        );
      }}
    </ModalOpener.Custom>;
  }

  // Fallback while loading
  return (
    <AnimatedButton
      variant={isConnected ? 'secondary' : 'primary'}
      size="sm"
      className="text-sm px-4 py-2"
      disabled
    >
      {isConnected && address
        ? `${address.slice(0, 4)}...${address.slice(-4)}`
        : 'Connect Wallet'}
    </AnimatedButton>
  );
}

// Simple fallback button
function FallbackButton() {
  const { address, isConnected } = useAccount();
  
  return (
    <AnimatedButton
      variant={isConnected ? 'secondary' : 'primary'}
      size="sm"
      className="text-sm px-4 py-2"
      disabled
    >
      {isConnected && address
        ? `${address.slice(0, 4)}...${address.slice(-4)}`
        : 'Connect Wallet'}
    </AnimatedButton>
  );
}

export default function ConnectedWalletButtonInner() {
  const { isWagmiReady } = useWallet();
  const { address, isConnected } = useAccount();

  // If wagmi isn't ready, show a simple button
  if (!isWagmiReady) {
    return (
      <AnimatedButton
        variant="secondary"
        size="sm"
        className="text-sm px-4 py-2"
        disabled
      >
        Loading...
      </AnimatedButton>
    );
  }

  // Wrap in error boundary to catch any RainbowKit errors
  return (
    <RainbowKitErrorBoundary fallback={<FallbackButton />}>
      <WalletButtonWithModal />
    </RainbowKitErrorBoundary>
  );
}
