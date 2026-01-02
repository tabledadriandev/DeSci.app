/**
 * API Route: Submit Weekly Merkle Root to Blockchain
 * Submits the Merkle root to the MerkleBiomarkerRegistry contract
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createWalletClient, http, parseUnits } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { getUserIdFromBody, getUserIdFromHeader } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// MerkleBiomarkerRegistry contract ABI
const MERKLE_REGISTRY_ABI = [
  {
    name: 'submitWeeklyRoot',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'merkleRoot', type: 'bytes32' },
      { name: 'weekTimestamp', type: 'uint256' },
    ],
    outputs: [],
  },
] as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = getUserIdFromBody(body) || getUserIdFromHeader(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { proofId, merkleRoot, weekStart } = body;

    if (!proofId || !merkleRoot || !weekStart) {
      return NextResponse.json(
        { error: 'Missing required fields: proofId, merkleRoot, weekStart' },
        { status: 400 }
      );
    }

    // Get user's wallet address
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { walletAddress: true },
    });

    if (!user?.walletAddress) {
      return NextResponse.json(
        { error: 'User wallet address not found' },
        { status: 400 }
      );
    }

    // Get contract address from environment
    const contractAddress = process.env.NEXT_PUBLIC_MERKLE_REGISTRY_CONTRACT as `0x${string}`;
    if (!contractAddress) {
      return NextResponse.json(
        { error: 'Merkle registry contract address not configured' },
        { status: 500 }
      );
    }

    // Convert weekStart to Unix timestamp
    const weekTimestamp = Math.floor(new Date(weekStart).getTime() / 1000);

    // Convert merkleRoot to bytes32 (ensure it's 0x-prefixed hex)
    const merkleRootBytes32 = merkleRoot.startsWith('0x')
      ? (merkleRoot as `0x${string}`)
      : (`0x${merkleRoot}` as `0x${string}`);

    // For server-side submission, we need a private key (stored securely)
    // In production, use a dedicated wallet or relayer service
    const privateKey = process.env.MERKLE_REGISTRY_PRIVATE_KEY as `0x${string}`;
    if (!privateKey) {
      return NextResponse.json(
        {
          error: 'Server-side submission not configured. Use client-side wallet signing instead.',
          requiresWallet: true,
          contractAddress,
          functionName: 'submitWeeklyRoot',
          args: [merkleRootBytes32, weekTimestamp.toString()],
        },
        { status: 400 }
      );
    }

    // Create wallet client
    const account = privateKeyToAccount(privateKey);
    const walletClient = createWalletClient({
      account,
      chain: base,
      transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org'),
    });

    // Submit transaction
    const hash = await walletClient.writeContract({
      address: contractAddress,
      abi: MERKLE_REGISTRY_ABI,
      functionName: 'submitWeeklyRoot',
      args: [merkleRootBytes32, BigInt(weekTimestamp)],
    });

    // Update proof with transaction hash
    await prisma.proofOfHealth.update({
      where: { id: proofId },
      data: { onchainTxHash: hash },
    });

    return NextResponse.json({
      success: true,
      data: {
        transactionHash: hash,
        proofId,
        merkleRoot: merkleRootBytes32,
        weekTimestamp,
      },
    });
  } catch (error) {
    console.error('Submit Merkle root error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to submit Merkle root';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
