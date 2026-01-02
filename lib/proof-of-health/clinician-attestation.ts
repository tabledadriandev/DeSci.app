/**
 * Clinician Attestation System
 * EIP-1271 signature verification for contract wallet signatures
 */

import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { hashMessage } from 'viem';

const EIP1271_MAGIC_VALUE = '0x1626ba7e';

/**
 * Verify EIP-1271 signature from a contract wallet
 */
export async function verifyClinicianSignature(
  clinicianContract: `0x${string}`,
  messageHash: `0x${string}`,
  signature: `0x${string}`
): Promise<boolean> {
  try {
    const client = createPublicClient({
      chain: base,
      transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org'),
    });

    // Create Ethereum signed message hash
    const ethSignedMessageHash = hashMessage({
      raw: messageHash as `0x${string}`,
    });

    // Call isValidSignature on the contract
    const result = await client.readContract({
      address: clinicianContract,
      abi: [
        {
          name: 'isValidSignature',
          type: 'function',
          stateMutability: 'view',
          inputs: [
            { name: 'hash', type: 'bytes32' },
            { name: 'signature', type: 'bytes' },
          ],
          outputs: [{ name: '', type: 'bytes4' }],
        },
      ],
      functionName: 'isValidSignature',
      args: [ethSignedMessageHash, signature],
    });

    return result === EIP1271_MAGIC_VALUE;
  } catch (error) {
    console.error('Verify clinician signature error:', error);
    return false;
  }
}

/**
 * Create message hash for clinician attestation
 */
export function createClinicianAttestationHash(
  userId: string,
  badgeType: string,
  dataHash: string
): string {
  // Create structured message for clinician to sign
  const message = JSON.stringify({
    userId,
    badgeType,
    dataHash,
    timestamp: Date.now(),
  });

  // Hash the message (in production, use EIP-712 structured data)
  return message; // Simplified - would use keccak256 hash
}

/**
 * Mint clinician-attested badge
 */
export async function mintClinicianAttestedBadge(
  userId: string,
  badgeType: string,
  dataHash: string,
  clinicianContract: `0x${string}`,
  signature: `0x${string}`
): Promise<{ success: boolean; tokenId?: string; error?: string }> {
  try {
    // Verify signature
    const messageHash = createClinicianAttestationHash(userId, badgeType, dataHash);
    const verified = await verifyClinicianSignature(
      clinicianContract,
      messageHash as `0x${string}`,
      signature
    );

    if (!verified) {
      return { success: false, error: 'Invalid clinician signature' };
    }

    // In production, call the smart contract to mint the badge
    // For now, return success
    return { success: true };
  } catch (error) {
    console.error('Mint clinician attested badge error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

/**
 * Get whitelisted clinician contract addresses
 */
export const WHITELISTED_CLINICIANS: Record<string, `0x${string}`> = {
  // Would be populated with actual clinician contract addresses
  // Example: 'dr_smith': '0x...',
};

/**
 * Check if a clinician contract is whitelisted
 */
export function isWhitelistedClinician(
  clinicianContract: `0x${string}`
): boolean {
  return Object.values(WHITELISTED_CLINICIANS).some(
    (addr) => addr.toLowerCase() === clinicianContract.toLowerCase()
  );
}







