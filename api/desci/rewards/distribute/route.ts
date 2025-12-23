/**
 * API Route: Distribute token reward to user
 */

import { NextRequest, NextResponse } from 'next/server';
import { createTokenRewardsService } from '@/lib/desci/tokenRewards';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, metadata, researchStudy } = body;

    if (!type) {
      return NextResponse.json(
        { error: 'Action type is required' },
        { status: 400 }
      );
    }

    const rewardsService = createTokenRewardsService();
    
    // Calculate reward
    const calculation = await rewardsService.calculateReward({
      type,
      userId: session.user.id,
      metadata,
    });

    // Distribute reward
    const result = await rewardsService.distributeReward(
      session.user.id,
      calculation,
      researchStudy
    );

    return NextResponse.json({
      success: true,
      contributionId: result.contributionId,
      transactionHash: result.transactionHash,
      reward: calculation.tokenReward,
      dataPoints: calculation.dataPoints,
      reason: calculation.reason,
    });
  } catch (error: any) {
    console.error('Reward distribution error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to distribute reward' },
      { status: 500 }
    );
  }
}
