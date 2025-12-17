'use client';

import { useCallback } from 'react';
import AnimatedButton from '@/components/ui/AnimatedButton';

interface WalletButtonProps {
  address?: string;
  isConnected: boolean;
  openConnectModal?: () => void;
}

export default function WalletButton({ address, isConnected, openConnectModal }: WalletButtonProps) {
  const handleClick = useCallback(() => {
    if (openConnectModal) {
      openConnectModal();
    }
  }, [openConnectModal]);

  return (
    <AnimatedButton
      onClick={handleClick}
      variant={isConnected ? 'secondary' : 'primary'}
      size="sm"
      className="text-sm px-4 py-2"
    >
      {isConnected && address
        ? `${address.slice(0, 4)}...${address.slice(-4)}`
        : 'Connect Wallet'}
    </AnimatedButton>
  );
}

