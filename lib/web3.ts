/**
 * Web3 Integration for Table d'Adrian Wellness App
 * Token gating, staking, payments, and wallet operations
 */

import { createPublicClient, http, formatUnits, parseUnits, encodeFunctionData } from 'viem';
import { base } from 'viem/chains';

const TA_CONTRACT = '0x9Cb5254319f824A2393ECbF6aDCf608867AA1b07' as `0x${string}`;
// Token gating removed - all users can access the app
// Wallet connection is optional but enables rewards and premium features

// ERC-20 ABI (minimal for balance checking)
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
] as const;

// TableDadrian Contract ABI - Extended with new integration functions
export const TABLEDADRIAN_ABI = [
  ...ERC20_ABI,
  {
    name: 'processBooking',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'userAddress', type: 'address' },
      { name: 'bookingId', type: 'string' },
      { name: 'tokenAmount', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    name: 'processNFTReward',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'recipient', type: 'address' },
      { name: 'nftCollectionId', type: 'string' },
      { name: 'rewardAmount', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    name: 'processEventTicket',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'attendee', type: 'address' },
      { name: 'eventId', type: 'string' },
      { name: 'ticketPrice', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    name: 'authorizedBookingServices',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'authorizedNFTPlatforms',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'authorizedEventServices',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;

export class Web3Service {
  private client;

  constructor() {
    this.client = createPublicClient({
      chain: base,
      transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org'),
    });
  }

  /**
   * Check if user has TA balance (for rewards/premium features)
   * Note: App access no longer requires minimum balance
   */
  async hasBalance(walletAddress: `0x${string}`): Promise<boolean> {
    try {
      const balance = await this.getBalance(walletAddress);
      return balance > BigInt(0);
    } catch (error) {
      console.error('Error checking balance:', error);
      return false;
    }
  }

  /**
   * Get TA token balance for a wallet
   */
  async getBalance(walletAddress: `0x${string}`): Promise<bigint> {
    try {
      const balance = await this.client.readContract({
        address: TA_CONTRACT,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [walletAddress],
      });
      return balance as bigint;
    } catch (error) {
      console.error('Error getting balance:', error);
      return BigInt(0);
    }
  }

  /**
   * Get formatted balance (human-readable)
   */
  async getFormattedBalance(walletAddress: `0x${string}`): Promise<string> {
    const balance = await this.getBalance(walletAddress);
    return formatUnits(balance, 18);
  }

  /**
   * Calculate USD value of TA balance
   */
  async getBalanceUSD(walletAddress: `0x${string}`, taPriceUSD: number): Promise<number> {
    const balance = await this.getFormattedBalance(walletAddress);
    return parseFloat(balance) * taPriceUSD;
  }

  /**
   * Check if user can stake
   */
  async canStake(walletAddress: `0x${string}`, amount: bigint): Promise<boolean> {
    const balance = await this.getBalance(walletAddress);
    return balance >= amount;
  }

  /**
   * Check if an address is an authorized booking service
   */
  async isAuthorizedBookingService(serviceAddress: `0x${string}`): Promise<boolean> {
    try {
      const result = await this.client.readContract({
        address: TA_CONTRACT,
        abi: TABLEDADRIAN_ABI,
        functionName: 'authorizedBookingServices',
        args: [serviceAddress],
      });
      return result as boolean;
    } catch (error) {
      console.error('Error checking booking service authorization:', error);
      return false;
    }
  }

  /**
   * Check if an address is an authorized NFT platform
   */
  async isAuthorizedNFTPlatform(platformAddress: `0x${string}`): Promise<boolean> {
    try {
      const result = await this.client.readContract({
        address: TA_CONTRACT,
        abi: TABLEDADRIAN_ABI,
        functionName: 'authorizedNFTPlatforms',
        args: [platformAddress],
      });
      return result as boolean;
    } catch (error) {
      console.error('Error checking NFT platform authorization:', error);
      return false;
    }
  }

  /**
   * Check if an address is an authorized event service
   */
  async isAuthorizedEventService(serviceAddress: `0x${string}`): Promise<boolean> {
    try {
      const result = await this.client.readContract({
        address: TA_CONTRACT,
        abi: TABLEDADRIAN_ABI,
        functionName: 'authorizedEventServices',
        args: [serviceAddress],
      });
      return result as boolean;
    } catch (error) {
      console.error('Error checking event service authorization:', error);
      return false;
    }
  }

  /**
   * Prepare transaction data for processBooking
   * Note: This requires the caller to be an authorized booking service
   */
  prepareProcessBookingTransaction(
    userAddress: `0x${string}`,
    bookingId: string,
    tokenAmount: bigint
  ) {
    return {
      to: TA_CONTRACT,
      data: encodeFunctionData({
        abi: TABLEDADRIAN_ABI,
        functionName: 'processBooking',
        args: [userAddress, bookingId, tokenAmount],
      }),
    };
  }

  /**
   * Prepare transaction data for processNFTReward
   * Note: This requires the caller to be an authorized NFT platform
   */
  prepareProcessNFTRewardTransaction(
    recipient: `0x${string}`,
    nftCollectionId: string,
    rewardAmount: bigint
  ) {
    return {
      to: TA_CONTRACT,
      data: encodeFunctionData({
        abi: TABLEDADRIAN_ABI,
        functionName: 'processNFTReward',
        args: [recipient, nftCollectionId, rewardAmount],
      }),
    };
  }

  /**
   * Prepare transaction data for processEventTicket
   * Note: This requires the caller to be an authorized event service
   */
  prepareProcessEventTicketTransaction(
    attendee: `0x${string}`,
    eventId: string,
    ticketPrice: bigint
  ) {
    return {
      to: TA_CONTRACT,
      data: encodeFunctionData({
        abi: TABLEDADRIAN_ABI,
        functionName: 'processEventTicket',
        args: [attendee, eventId, ticketPrice],
      }),
    };
  }
}

export const web3Service = new Web3Service();

