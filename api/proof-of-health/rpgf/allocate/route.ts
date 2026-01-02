/**
 * API Route: Allocate RPGF Rewards (DAO)
 * Allocates retroactive funding to data donors (admin/DAO only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { allocateRPGF, distributeRewards } from '@/lib/proof-of-health/rpgf';
import { getUserIdFromHeader } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromHeader(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Check if user is admin/DAO member
    // const isAdmin = await checkAdmin(userId);
    // if (!isAdmin) {
    //   return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    // }

    const body = await request.json();
    const { quarter, totalAllocation } = body;

    if (!quarter || !totalAllocation) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: quarter (e.g., "2025-Q1"), totalAllocation',
        },
        { status: 400 }
      );
    }

    // Allocate rewards
    const allocations = await allocateRPGF(quarter, totalAllocation);

    // Distribute rewards
    const result = await distributeRewards(quarter, allocations);

    return NextResponse.json({
      success: true,
      data: {
        quarter,
        totalAllocation,
        distributed: result.distributed,
        allocations: allocations.map((a) => ({
          userId: a.userId,
          allocation: a.allocation,
          score: a.score,
        })),
      },
    });
  } catch (error) {
    console.error('Allocate RPGF error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to allocate RPGF rewards';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
