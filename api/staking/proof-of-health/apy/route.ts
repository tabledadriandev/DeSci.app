/**
 * API Route: Get Calculated APY
 * Returns the APY for a user based on their badges
 */

import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { getUserIdFromHeader } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const QUADRATIC_STAKING_ABI = [
  {
    name: 'calculateAPY',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getStakingInfo',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      { name: 'stakedAmount', type: 'uint256' },
      { name: 'apyBps', type: 'uint256' },
      { name: 'rewards', type: 'uint256' },
      { name: 'badgeCount', type: 'uint256' },
    ],
  },
] as const;

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromHeader(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    const client = createPublicClient({
      chain: base,
      transport: http(
        process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org'
      ),
    });

    try {
      const info = await client.readContract({
        address: contractAddress,
        abi: QUADRATIC_STAKING_ABI,
        functionName: 'getStakingInfo',
        args: [user.walletAddress as `0x${string}`],
      });

      const apyBps = Number(info[1]);
      const apyPercent = apyBps / 100;

      return NextResponse.json({
        success: true,
        data: {
          stakedAmount: info[0].toString(),
          apyBps: apyBps.toString(),
          apyPercent,
          rewards: info[2].toString(),
          badgeCount: Number(info[3]),
          breakdown: {
            baseAPY: 5,
            badgeMultiplier: Number(info[3]) * 2,
            clinicianBonus: 0, // Would check if user has clinician badge
            total: apyPercent,
          },
        },
      });
    } catch (error) {
      // If contract not deployed or user not staked, return default
      return NextResponse.json({
        success: true,
        data: {
          stakedAmount: '0',
          apyBps: '500',
          apyPercent: 5,
          rewards: '0',
          badgeCount: 0,
          breakdown: {
            baseAPY: 5,
            badgeMultiplier: 0,
            clinicianBonus: 0,
            total: 5,
          },
        },
      });
    }
  } catch (error) {
    console.error('Get APY error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to get APY';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
