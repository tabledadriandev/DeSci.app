'use client';

/**
 * Minimal placeholder for a wallet/account hook so the app can compile.
 * In a full implementation, this would be wired to wagmi / RainbowKit or your
 * chosen web3 provider and return the connected wallet address and status.
 */

export interface AccountInfo {
  address?: `0x${string}`;
  isConnected: boolean;
}

export function useAccount(): AccountInfo {
  // For now, always report as disconnected with no address.
  return {
    address: undefined,
    isConnected: false,
  };
}

