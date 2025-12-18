import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/user/stats
 * Stub endpoint - returns default stats for new users
 * Full implementation moved to api_disabled/api/user/stats/route.ts
 */

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  // Return default stats for new users
  return NextResponse.json({
    healthScore: 0,
    streak: 0,
    xp: 0,
    lastActive: undefined,
  });
}

