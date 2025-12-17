'use client';

import { useAccount } from '@/hooks/useAccount';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import AnimatedButton from '@/components/ui/AnimatedButton';

export default function ConnectedWalletButtonInner() {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  return (
    <AnimatedButton
      onClick={openConnectModal}
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

