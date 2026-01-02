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
        stakings: {
          where: {
            status: 'active',
            unlockDate: {
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
      for (const stake of user.stakings) {
        totalStaked += stake.amount;
        // Calculate multiplier based on lock-up period (Staking model doesn't have multiplier field)
        const daysLocked = stake.unlockDate 
          ? Math.floor((stake.unlockDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
          : 0;
        let multiplier = 1.0;
        if (daysLocked >= 365) multiplier = 5.0;
        else if (daysLocked >= 180) multiplier = 3.0;
        else if (daysLocked >= 90) multiplier = 2.0;
        else if (daysLocked >= 30) multiplier = 1.5;
        
        const stakeWeightedPower = stake.amount * multiplier;
        totalWeightedPower += stakeWeightedPower;
        // Subtract base weight for staked amount (already counted in baseWeight)
        totalWeightedPower -= stake.amount;
        maxMultiplier = Math.max(maxMultiplier, multiplier);
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
        weightedStaked: user?.stakings.reduce((sum: number, s: { amount: number; unlockDate: Date | null }) => {
          const daysLocked = s.unlockDate 
            ? Math.floor((s.unlockDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
            : 0;
          let multiplier = 1.0;
          if (daysLocked >= 365) multiplier = 5.0;
          else if (daysLocked >= 180) multiplier = 3.0;
          else if (daysLocked >= 90) multiplier = 2.0;
          else if (daysLocked >= 30) multiplier = 1.5;
          return sum + (s.amount * multiplier);
        }, 0) || 0,
      },
    });
  } catch (error: unknown) {
    console.error('Error calculating voting power:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to calculate voting power';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

