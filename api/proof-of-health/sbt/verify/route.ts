/**
 * API Route: Verify Badge Ownership
 * Verifies that a user owns a specific badge onchain
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { getUserIdFromHeader } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const HEALTH_BADGE_SBT_ABI = [
  {
    name: 'ownerOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    name: 'hasBadge',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'badgeType', type: 'uint8' },
    ],
    outputs: [
      { name: 'hasBadge', type: 'bool' },
      { name: 'tokenId', type: 'uint256' },
    ],
  },
] as const;

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromHeader(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tokenId = searchParams.get('tokenId');
    const badgeType = searchParams.get('badgeType');

    if (!tokenId && !badgeType) {
      return NextResponse.json(
        { error: 'Missing tokenId or badgeType' },
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
      .NEXT_PUBLIC_HEALTH_BADGE_SBT_CONTRACT as `0x${string}`;
    if (!contractAddress) {
      return NextResponse.json(
        { error: 'HealthBadgeSBT contract address not configured' },
        { status: 500 }
      );
    }

    const client = createPublicClient({
      chain: base,
      transport: http(
        process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org'
      ),
    });

    let verified = false;
    let onchainTokenId: string | null = null;

    if (tokenId) {
      // Verify by token ID
      try {
        const owner = await client.readContract({
          address: contractAddress,
          abi: HEALTH_BADGE_SBT_ABI,
          functionName: 'ownerOf',
          args: [BigInt(tokenId)],
        });

        verified =
          owner.toLowerCase() === user.walletAddress.toLowerCase();
        onchainTokenId = tokenId;
      } catch (error) {
        // Token doesn't exist or error
        verified = false;
      }
    } else if (badgeType) {
      // Verify by badge type
      const badgeTypeMap: Record<string, number> = {
        '30_day_adherence': 0,
        clinician_attested: 1,
        sleep_improvement: 2,
        metabolic_signature: 3,
        protocol_warrior: 4,
      };

      const badgeTypeNum = badgeTypeMap[badgeType];
      if (badgeTypeNum === undefined) {
        return NextResponse.json(
          { error: 'Invalid badge type' },
          { status: 400 }
        );
      }

      try {
        const result = await client.readContract({
          address: contractAddress,
          abi: HEALTH_BADGE_SBT_ABI,
          functionName: 'hasBadge',
          args: [user.walletAddress as `0x${string}`, badgeTypeNum],
        });

        verified = result[0];
        onchainTokenId = result[1].toString();
      } catch (error) {
        verified = false;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        verified,
        tokenId: onchainTokenId,
        userAddress: user.walletAddress,
      },
    });
  } catch (error) {
    console.error('Verify badge error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to verify badge';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
