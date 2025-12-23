import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base } from 'wagmi/chains';

// Get WalletConnect project ID from environment
// If not set, the app will use local defaults (may show 403 warning which is harmless)
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

// Note: To remove the 403 warning, get a free WalletConnect project ID from:
// https://cloud.walletconnect.com
// Then set NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID in your .env file

export const wagmiConfig = getDefaultConfig({
  appName: "Table d'Adrian Wellness",
  projectId: projectId || 'default-project-id', // Falls back to local defaults
  chains: [base],
  ssr: true,
});

