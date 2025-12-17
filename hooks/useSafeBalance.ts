'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/app/components/WalletProviders';

interface BalanceResult {
  data?: {
    formatted: string;
    symbol: string;
    value: bigint;
    decimals: number;
  };
  isLoading: boolean;
  isError: boolean;
  error?: Error;
}

interface UseBalanceParams {
  address?: `0x${string}`;
  token?: `0x${string}`;
  chainId?: number;
}

/**
 * Safe replacement for wagmi's useBalance hook.
 * Returns safe defaults when wagmi isn't ready.
 */
export function useSafeBalance(params: UseBalanceParams): BalanceResult {
  const { isWagmiReady } = useWallet();
  const [result, setResult] = useState<BalanceResult>({
    data: undefined,
    isLoading: true,
    isError: false,
  });

  useEffect(() => {
    if (!isWagmiReady || !params.address) {
      setResult({
        data: undefined,
        isLoading: false,
        isError: false,
      });
      return;
    }

    let mounted = true;

    const fetchBalance = async () => {
      try {
        const { getBalance } = await import('@wagmi/core');
        const { wagmiConfig } = await import('@/lib/wagmi-config');
        
        if (!mounted) return;

        const balanceResult = await getBalance(wagmiConfig, {
          address: params.address!,
          token: params.token,
          chainId: params.chainId,
        });

        if (mounted) {
          setResult({
            data: {
              formatted: balanceResult.formatted,
              symbol: balanceResult.symbol,
              value: balanceResult.value,
              decimals: balanceResult.decimals,
            },
            isLoading: false,
            isError: false,
          });
        }
      } catch (error) {
        if (mounted) {
          console.warn('Failed to fetch balance:', error);
          setResult({
            data: undefined,
            isLoading: false,
            isError: true,
            error: error as Error,
          });
        }
      }
    };

    fetchBalance();

    return () => {
      mounted = false;
    };
  }, [isWagmiReady, params.address, params.token, params.chainId]);

  return result;
}

// Alias for drop-in replacement
export const useBalance = useSafeBalance;

