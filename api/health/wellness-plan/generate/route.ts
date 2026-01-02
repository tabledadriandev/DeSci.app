import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { buildWellnessPlan } from '@/lib/wellness-plan/plan-generator';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 },
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { walletAddress: userId },
          { email: userId },
        ],
      },
      // TODO: HealthAssessments and healthScores relations not yet implemented
      // Fetch separately if needed
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please complete a health assessment first.' },
        { status: 404 },
      );
    }

    // Fetch health score separately
    const healthScore = await prisma.healthScore.findFirst({
      where: { userId: user.id },
      orderBy: { calculatedAt: 'desc' },
    });

    // TODO: HealthAssessment model not yet implemented
    const assessment: Record<string, unknown> = {};
    const profile: Record<string, unknown> | undefined = undefined;

    if (!healthScore) {
      return NextResponse.json(
        { error: 'Please complete a health assessment first.' },
        { status: 400 },
      );
    }

    // Generate personalized wellness plan
    const planData = buildWellnessPlan({
      assessment,
      healthScore,
      profile,
      reason: 'initial',
    });

    // TODO: WellnessPlan model not yet implemented, use LongevityPlan instead
    // Deactivate old plans
    await prisma.longevityPlan.updateMany({
      where: {
        userId: user.id,
        status: 'active',
      },
      data: {
        status: 'paused',
      },
    });

    // Create new plan using LongevityPlan model
    const newPlan = await prisma.longevityPlan.create({
      data: {
        userId: user.id,
        planType: 'combined',
        recommendations: planData as Prisma.InputJsonValue,
        startDate: new Date(),
        status: 'active',
      },
    });

    return NextResponse.json({ success: true, plan: newPlan });
  } catch (error: unknown) {
    console.error('Error generating wellness plan:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate plan';
    return NextResponse.json(
      { error: 'Failed to generate plan', details: errorMessage },
      { status: 500 },
    );
  }
}

