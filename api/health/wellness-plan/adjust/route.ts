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

    // Look at recent biomarkers and daily habits to slightly adjust plan
    const [recentBiomarkers, recentHabits] = await Promise.all([
      prisma.biomarker.findMany({
        where: { userId: user.id },
        orderBy: { recordedAt: 'desc' },
        take: 5,
      }),
      prisma.dailyHabits.findMany({
        where: { userId: user.id },
        orderBy: { date: 'desc' },
        take: 14,
      }),
    ]);

    const biomarkerTrend = computeBiomarkerTrend(recentBiomarkers);
    const habitsSummary = computeHabitsSummary(recentHabits);

    const planData = buildWellnessPlan({
      assessment,
      healthScore,
      profile,
      biomarkerTrend,
      habitsSummary,
      reason: 'adjustment',
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

    const newPlan = await prisma.wellnessPlan.create({
      data: {
        userId: user.id,
        ...planData,
      },
    });

    return NextResponse.json({ success: true, plan: newPlan });
  } catch (error: any) {
    console.error('Error adjusting wellness plan:', error);
    return NextResponse.json(
      { error: 'Failed to adjust plan', details: error.message },
      { status: 500 },
    );
  }
}

function computeBiomarkerTrend(biomarkers: any[]) {
  if (!biomarkers || biomarkers.length === 0) return {};

  const sorted = [...biomarkers].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  let weightTrend: 'up' | 'down' | 'stable' | undefined;
  if (first.weight != null && last.weight != null) {
    if (last.weight > first.weight + 1) weightTrend = 'up';
    else if (last.weight < first.weight - 1) weightTrend = 'down';
    else weightTrend = 'stable';
  }

  const avgSleepHours = average(
    biomarkers
      .map((b) => (b.sleepHours as number | null) ?? null)
      .filter((v) => typeof v === 'number') as number[],
  );

  return {
    weightTrend,
    avgSleepHours,
  };
}

function computeHabitsSummary(habits: any[]) {
  if (!habits || habits.length === 0) return {};

  const avgSteps = average(
    habits
      .map((h) => (h.steps as number | null) ?? null)
      .filter((v) => typeof v === 'number') as number[],
  );
  const avgMeditationMinutes = average(
    habits
      .map((h) => (h.meditationMinutes as number | null) ?? null)
      .filter((v) => typeof v === 'number') as number[],
  );
  const avgWaterIntake = average(
    habits
      .map((h) => (h.waterIntake as number | null) ?? null)
      .filter((v) => typeof v === 'number') as number[],
  );

  return {
    avgSteps,
    avgMeditationMinutes,
    avgWaterIntake,
  };
}

function average(values: number[]) {
  if (!values.length) return null;
  const sum = values.reduce((acc, v) => acc + v, 0);
  return Math.round((sum / values.length) * 10) / 10;
}


