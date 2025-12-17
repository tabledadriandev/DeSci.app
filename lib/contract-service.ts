/**
 * Contract Service for TableDadrian Smart Contract
 * Handles write operations to the contract
 * 
 * Note: Requires BACKEND_WALLET_PRIVATE_KEY to be set in environment variables
 * The backend wallet must be authorized as a booking service, NFT platform, or event service
 */

import { createWalletClient, http, parseUnits } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { TABLEDADRIAN_ABI } from './web3';
import { TA_CONTRACT_ADDRESS } from '../../ta_contract/contract-address';

const TA_CONTRACT = TA_CONTRACT_ADDRESS;

export class ContractService {
  private walletClient;
  private account;

  constructor() {
    // Only initialize if private key is available
    const privateKey = process.env.BACKEND_WALLET_PRIVATE_KEY;
    if (!privateKey) {
      console.warn('BACKEND_WALLET_PRIVATE_KEY not set - contract write operations will be disabled');
      return;
    }

    try {
      this.account = privateKeyToAccount(privateKey as `0x${string}`);
      this.walletClient = createWalletClient({
        account: this.account,
        chain: base,
        transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org'),
      });
    } catch (error) {
      console.error('Error initializing contract service:', error);
    }
  }

  /**
   * Process a booking payment on-chain
   * Requires: Backend wallet must be authorized as a booking service
   */
  async processBooking(
    userAddress: `0x${string}`,
    bookingId: string,
    tokenAmount: number // Amount in TA tokens (will be converted to wei)
  ): Promise<string> {
    if (!this.walletClient || !this.account) {
      throw new Error('Contract service not initialized - BACKEND_WALLET_PRIVATE_KEY required');
    }

    const amountInWei = parseUnits(tokenAmount.toString(), 18);

    try {
      const hash = await this.walletClient.writeContract({
        address: TA_CONTRACT,
        abi: TABLEDADRIAN_ABI,
        functionName: 'processBooking',
        args: [userAddress, bookingId, amountInWei],
      });

      return hash;
    } catch (error: any) {
      console.error('Error processing booking on-chain:', error);
      throw new Error(error.message || 'Failed to process booking on-chain');
    }
  }

  /**
   * Process NFT reward distribution on-chain
   * Requires: Backend wallet must be authorized as an NFT platform
   */
  async processNFTReward(
    recipient: `0x${string}`,
    nftCollectionId: string,
    rewardAmount: number // Amount in TA tokens (will be converted to wei)
  ): Promise<string> {
    if (!this.walletClient || !this.account) {
      throw new Error('Contract service not initialized - BACKEND_WALLET_PRIVATE_KEY required');
    }

    const amountInWei = parseUnits(rewardAmount.toString(), 18);

    try {
      const hash = await this.walletClient.writeContract({
        address: TA_CONTRACT,
        abi: TABLEDADRIAN_ABI,
        functionName: 'processNFTReward',
        args: [recipient, nftCollectionId, amountInWei],
      });

      return hash;
    } catch (error: any) {
      console.error('Error processing NFT reward on-chain:', error);
      throw new Error(error.message || 'Failed to process NFT reward on-chain');
    }
  }

  /**
   * Process event ticket payment on-chain
   * Requires: Backend wallet must be authorized as an event service
   */
  async processEventTicket(
    attendee: `0x${string}`,
    eventId: string,
    ticketPrice: number // Amount in TA tokens (will be converted to wei)
  ): Promise<string> {
    if (!this.walletClient || !this.account) {
      throw new Error('Contract service not initialized - BACKEND_WALLET_PRIVATE_KEY required');
    }

    const amountInWei = parseUnits(ticketPrice.toString(), 18);

    try {
      const hash = await this.walletClient.writeContract({
        address: TA_CONTRACT,
        abi: TABLEDADRIAN_ABI,
        functionName: 'processEventTicket',
        args: [attendee, eventId, amountInWei],
      });

      return hash;
    } catch (error: any) {
      console.error('Error processing event ticket on-chain:', error);
      throw new Error(error.message || 'Failed to process event ticket on-chain');
    }
  }

  /**
   * Get the backend wallet address
   */
  getBackendWalletAddress(): `0x${string}` | null {
    return this.account?.address || null;
  }
}

export const contractService = new ContractService();

