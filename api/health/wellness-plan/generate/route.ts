import { NextRequest, NextResponse } from 'next/server';
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
      include: {
        profile: true,
        healthAssessments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        healthScores: {
          orderBy: { date: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please complete a health assessment first.' },
        { status: 404 },
      );
    }

    const assessment = user.healthAssessments[0];
    const healthScore = user.healthScores[0];
    const profile = user.profile;

    if (!assessment) {
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

    // Deactivate old plans
    await prisma.wellnessPlan.updateMany({
      where: {
        userId: user.id,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    // Create new plan
    const newPlan = await prisma.wellnessPlan.create({
      data: {
        userId: user.id,
        ...planData,
      },
    });

    return NextResponse.json({ success: true, plan: newPlan });
  } catch (error: any) {
    console.error('Error generating wellness plan:', error);
    return NextResponse.json(
      { error: 'Failed to generate plan', details: error.message },
      { status: 500 },
    );
  }
}

