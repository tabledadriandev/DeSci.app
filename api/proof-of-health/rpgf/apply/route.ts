/**
 * API Route: Apply for RPGF Round
 * Users apply to be considered for retroactive public goods funding
 */

import { NextRequest, NextResponse } from 'next/server';
import { calculateDataDonorScore } from '@/lib/proof-of-health/rpgf';
import { getUserIdFromHeader } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromHeader(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { quarter } = body;

    if (!quarter) {
      return NextResponse.json(
        { error: 'Missing required field: quarter (e.g., "2025-Q1")' },
        { status: 400 }
      );
    }

    // Calculate user's score
    const score = await calculateDataDonorScore(userId, quarter);

    return NextResponse.json({
      success: true,
      data: {
        quarter,
        score: {
          dataCompleteness: score.dataCompleteness,
          privacyScore: score.privacyScore,
          researchImpact: score.researchImpact,
          totalScore: score.totalScore,
        },
        message:
          'Application submitted. Allocation will be determined at end of quarter.',
      },
    });
  } catch (error) {
    console.error('Apply for RPGF error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to apply for RPGF';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
