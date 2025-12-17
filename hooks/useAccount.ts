'use client';

import { useWallet, SafeAccountData } from '@/app/components/WalletProviders';

/**
 * Safe replacement for wagmi's useAccount hook.
 * Uses our WalletContext which always provides safe defaults,
 * even before wagmi is fully loaded.
 * 
 * Usage: Replace `import { useAccount } from 'wagmi'` with
 * `import { useAccount } from '@/hooks/useAccount'`
 */
export function useAccount(): SafeAccountData {
  const { account } = useWallet();
  return account;
}

export default useAccount;

