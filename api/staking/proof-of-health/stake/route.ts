/**
 * API Route: Stake with Adherence Badges
 * Stakes tokens with adherence multiplier based on health badges
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createWalletClient, http } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { getUserIdFromBody, getUserIdFromHeader } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const QUADRATIC_STAKING_ABI = [
  {
    name: 'stakeWithAdherence',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'badgeIds', type: 'uint256[]' },
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

    const { amount, badgeIds } = body;

    if (!amount || !badgeIds || !Array.isArray(badgeIds)) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, badgeIds' },
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

    const contractAddress = process.env
      .NEXT_PUBLIC_QUADRATIC_STAKING_CONTRACT as `0x${string}`;
    if (!contractAddress) {
      return NextResponse.json(
        { error: 'QuadraticStaking contract address not configured' },
        { status: 500 }
      );
    }

    // For client-side signing, return transaction data
    // For server-side, would use private key
    return NextResponse.json({
      success: true,
      data: {
        contractAddress,
        functionName: 'stakeWithAdherence',
        args: [BigInt(amount).toString(), badgeIds.map((id: string) => BigInt(id).toString())],
        message: 'Sign transaction with your wallet to stake tokens',
      },
    });
  } catch (error) {
    console.error('Stake with adherence error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to stake with adherence';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
