/**
 * Get Longevity Plan API
 * Returns latest active longevity plan
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

    // Get latest active plan
    const plan = await prisma.longevityPlan.findFirst({
      where: {
        userId,
        status: 'active',
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!plan) {
      return NextResponse.json({
        plan: null,
      });
    }

    return NextResponse.json({
      plan: {
        nutrition: plan.mealPlan,
        exercise: plan.exercisePlan,
        supplements: plan.supplementStack,
        sleep: (plan.recommendations as any)?.sleep,
        stress: (plan.recommendations as any)?.stress,
        expectedResults: plan.expectedResults,
      },
    });
  } catch (error: any) {
    console.error('Get longevity plan error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get longevity plan' },
      { status: 500 }
    );
  }
}
