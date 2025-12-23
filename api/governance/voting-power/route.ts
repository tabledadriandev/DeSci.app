import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { web3Service } from '@/lib/web3';

export const dynamic = 'force-dynamic';

/**
 * Calculate voting power with lock-up multipliers
 * Base weight = token balance
 * Multiplier based on lock-up period:
 * - No lock: 1.0x
 * - 30 days: 1.5x
 * - 90 days: 2.0x
 * - 180 days: 3.0x
 * - 365 days: 5.0x
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      );
    }

    // Get token balance
    const balance = await web3Service.getBalance(address as `0x${string}`);
    const baseWeight = parseFloat((balance / BigInt(1e18)).toString());

    // Get active stakes with lock-up periods
    const user = await prisma.user.findUnique({
      where: { walletAddress: address },
      include: {
        stakes: {
          where: {
            status: 'active',
            lockedUntil: {
              gt: new Date(),
            },
          },
        },
      },
    });

    // Calculate weighted voting power from stakes
    let totalWeightedPower = baseWeight;
    let totalStaked = 0;
    let maxMultiplier = 1.0;

    if (user) {
      for (const stake of user.stakes) {
        totalStaked += stake.amount;
        const stakeWeightedPower = stake.amount * stake.multiplier;
        totalWeightedPower += stakeWeightedPower;
        // Subtract base weight for staked amount (already counted in baseWeight)
        totalWeightedPower -= stake.amount;
        maxMultiplier = Math.max(maxMultiplier, stake.multiplier);
      }
    }

    return NextResponse.json({
      baseWeight,
      totalWeightedPower: Math.max(0, totalWeightedPower),
      totalStaked,
      maxMultiplier,
      unstakedBalance: baseWeight - totalStaked,
      breakdown: {
        unstaked: baseWeight - totalStaked,
        staked: totalStaked,
        weightedStaked: user?.stakes.reduce((sum, s) => sum + (s.amount * s.multiplier), 0) || 0,
      },
    });
  } catch (error: any) {
    console.error('Error calculating voting power:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to calculate voting power' },
      { status: 500 }
    );
  }
}

