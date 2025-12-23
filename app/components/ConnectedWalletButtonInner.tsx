'use client';

import React from 'react';
import { Wallet } from 'lucide-react';
import AnimatedButton from '@/components/ui/AnimatedButton';

interface ConnectedWalletButtonInnerProps {
  className?: string;
}

/**
 * Minimal placeholder for the connected wallet button.
 * In a full implementation, this would read actual wallet state from your web3 provider.
 */
export default function ConnectedWalletButtonInner({
  className,
}: ConnectedWalletButtonInnerProps) {
  return (
    <AnimatedButton
      className={className}
      variant="secondary"
      size="sm"
      aria-label="Connect wallet"
    >
      <Wallet className="w-4 h-4 mr-2" />
      <span>Connect Wallet</span>
    </AnimatedButton>
  );
}

