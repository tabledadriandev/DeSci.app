/**
 * Get Biological Age API
 * Returns latest biological age calculation
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    // Get latest biological age calculation
    const latest = await prisma.biologicalAge.findFirst({
      where: { userId },
      orderBy: { calculatedAt: 'desc' },
    });

    if (!latest) {
      return NextResponse.json({
        biologicalAge: null,
        chronologicalAge: null,
        factors: null,
      });
    }

    return NextResponse.json({
      biologicalAge: latest.biologicalAge,
      chronologicalAge: latest.chronologicalAge,
      factors: {
        cardiacAge: latest.cardiacAge,
        sleepAge: latest.sleepAge,
        activityAge: latest.activityAge,
        recoveryAge: latest.recoveryAge,
        drivers: (latest.factors as any)?.drivers || {},
      },
    });
  } catch (error: any) {
    console.error('Get biological age error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get biological age' },
      { status: 500 }
    );
  }
}
