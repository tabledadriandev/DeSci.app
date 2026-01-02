/**
 * API Route: Calculate token reward for an action
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

    const { type, metadata } = body;

    if (!type) {
      return NextResponse.json(
        { error: 'Action type is required' },
        { status: 400 }
      );
    }

    const rewardsService = createTokenRewardsService();
    const calculation = await rewardsService.calculateReward({
      type,
      userId,
      metadata,
    });

    return NextResponse.json({
      success: true,
      calculation,
    });
  } catch (error) {
    console.error('Reward calculation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Reward calculation failed';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
