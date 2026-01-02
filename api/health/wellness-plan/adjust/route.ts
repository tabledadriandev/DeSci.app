import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
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
      // TODO: HealthAssessments, healthScores relations not yet implemented
      // Fetch separately if needed
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please complete a health assessment first.' },
        { status: 404 },
      );
    }

    // TODO: HealthAssessment model not yet implemented
    const assessment: Record<string, unknown> = {};
    
    // Fetch health score separately
    const healthScore = await prisma.healthScore.findFirst({
      where: { userId: user.id },
      orderBy: { calculatedAt: 'desc' },
    });

    if (!healthScore) {
      return NextResponse.json(
        { error: 'Please complete a health assessment first.' },
        { status: 400 },
      );
    }

    // Look at recent biomarkers (using BiomarkerReading) and daily habits to slightly adjust plan
    const [recentBiomarkers, recentHabits] = await Promise.all([
      prisma.biomarkerReading.findMany({
        where: { userId: user.id },
        orderBy: { date: 'desc' },
        take: 5,
      }),
      // TODO: DailyHabits model not yet implemented
      Promise.resolve([] as unknown[]),
    ]);

    const biomarkerTrend = computeBiomarkerTrend(recentBiomarkers);
    const habitsSummary = computeHabitsSummary(recentHabits);

    const planData = buildWellnessPlan({
      assessment,
      healthScore,
      profile: undefined, // Profile not in User model
      biomarkerTrend,
      habitsSummary,
      reason: 'adjustment',
    });

    // TODO: WellnessPlan model exists but may need adjustment
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

    // Use LongevityPlan instead of WellnessPlan
    const newPlan = await prisma.longevityPlan.create({
      data: {
        userId: user.id,
        planType: 'combined',
        recommendations: planData as unknown as Prisma.InputJsonValue,
        startDate: new Date(),
        status: 'active',
      },
    });

    return NextResponse.json({ success: true, plan: newPlan });
  } catch (error: unknown) {
    console.error('Error adjusting wellness plan:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to adjust plan';
    return NextResponse.json(
      { error: 'Failed to adjust plan', details: errorMessage },
      { status: 500 },
    );
  }
}

function computeBiomarkerTrend(biomarkers: Array<{ date: Date; value: number; metric: string }>) {
  if (!biomarkers || biomarkers.length === 0) return {};

  const sorted = [...biomarkers].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  // Find weight readings
  const weightReadings = biomarkers.filter((b: typeof biomarkers[0]) => b.metric === 'weight');
  let weightTrend: 'up' | 'down' | 'stable' | undefined;
  if (weightReadings.length >= 2) {
    const firstWeight = weightReadings[0].value;
    const lastWeight = weightReadings[weightReadings.length - 1].value;
    if (lastWeight > firstWeight + 1) weightTrend = 'up';
    else if (lastWeight < firstWeight - 1) weightTrend = 'down';
    else weightTrend = 'stable';
  }

  // Sleep hours not in BiomarkerReading model
  const avgSleepHours = null;

  return {
    weightTrend,
    avgSleepHours,
  };
}

function computeHabitsSummary(habits: unknown[]) {
  if (!habits || habits.length === 0) return {};

  const avgSteps = average(
    habits
      .map((h: typeof habits[0]) => {
        const habit = h as Record<string, unknown>;
        return (habit.steps as number | null) ?? null;
      })
      .filter((v) => typeof v === 'number') as number[],
  );
  const avgMeditationMinutes = average(
    habits
      .map((h: typeof habits[0]) => {
        const habit = h as Record<string, unknown>;
        return (habit.meditationMinutes as number | null) ?? null;
      })
      .filter((v) => typeof v === 'number') as number[],
  );
  const avgWaterIntake = average(
    habits
      .map((h: typeof habits[0]) => {
        const habit = h as Record<string, unknown>;
        return (habit.waterIntake as number | null) ?? null;
      })
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
  const sum = values.reduce((acc: number, v: number) => acc + v, 0);
  return Math.round((sum / values.length) * 10) / 10;
}


