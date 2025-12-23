/**
 * API Route: Get user's token earnings
 */

import { NextRequest, NextResponse } from 'next/server';
import { createTokenRewardsService } from '@/lib/desci/tokenRewards';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rewardsService = createTokenRewardsService();
    const earnings = await rewardsService.getUserTokenEarnings(session.user.id);
    const breakdown = await rewardsService.getUserEarningsBreakdown(session.user.id);

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
