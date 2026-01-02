/**
 * API Route: Distribute token reward to user
 */

import { NextRequest, NextResponse } from 'next/server';
import { createTokenRewardsService } from '@/lib/desci/tokenRewards';
import { getUserIdFromBody, getUserIdFromHeader } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = getUserIdFromBody(body) || getUserIdFromHeader(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
      userId,
      metadata,
    });

    // Distribute reward
    const result = await rewardsService.distributeReward(
      userId,
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
  } catch (error) {
    console.error('Reward distribution error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to distribute reward';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
