/**
 * API Route: Get user's token earnings
 */

import { NextRequest, NextResponse } from 'next/server';
import { createTokenRewardsService } from '@/lib/desci/tokenRewards';
import { getUserIdFromHeader } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromHeader(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rewardsService = createTokenRewardsService();
    const earnings = await rewardsService.getUserTokenEarnings(userId);
    const breakdown = await rewardsService.getUserEarningsBreakdown(userId);

    return NextResponse.json({
      success: true,
      earnings,
      breakdown,
    });
  } catch (error: any) {
    console.error('Earnings fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch earnings' },
      { status: 500 }
    );
  }
}
