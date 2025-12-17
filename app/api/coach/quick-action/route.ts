import { NextRequest, NextResponse } from 'next/server';
import {
  NutritionOptimizationModule,
  FitnessMovementModule,
  SleepOptimizationModule,
  StressMentalWellnessModule,
  BiomarkerInterpretationModule,
} from '@/lib/ai-coach/modules';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getUserContext(userId: string) {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ walletAddress: userId }, { email: userId }],
    },
    include: {
      profile: true,
      healthData: { take: 10, orderBy: { recordedAt: 'desc' } },
      biomarkers: { take: 5, orderBy: { recordedAt: 'desc' } },
      mealLogs: { take: 5, orderBy: { date: 'desc' } },
    },
  });

  return {
    profile: user?.profile,
    healthData: user?.healthData || [],
    biomarkers: user?.biomarkers || [],
    mealLogs: user?.mealLogs || [],
  };
}

export async function POST(request: NextRequest) {
  try {
    const { userId, action } = await request.json();

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'User ID and action required' },
        { status: 400 }
      );
    }

    const userContext = await getUserContext(userId);
    let response;

    switch (action) {
      case 'analyze_last_meal':
        const lastMeal = userContext.mealLogs?.[0];
        if (!lastMeal) {
          return NextResponse.json(
            { error: 'No recent meals found. Please log a meal first.' },
            { status: 404 }
          );
        }
        const nutritionModule = new NutritionOptimizationModule();
        response = await nutritionModule.analyzeMeal(lastMeal, userContext);
        break;

      case 'generate_workout_today':
        const fitnessModule = new FitnessMovementModule();
        const goals = userContext.profile?.healthGoals || ['General fitness'];
        response = await fitnessModule.generateWorkoutPlan(goals, userContext, 1);
        break;

      case 'improve_sleep_tonight':
        const sleepModule = new SleepOptimizationModule();
        response = await sleepModule.designBedtimeRoutine(userContext);
        break;

      case 'reduce_stress_now':
        const stressModule = new StressMentalWellnessModule();
        response = await stressModule.designBreathworkProtocol('stress_reduction', userContext);
        break;

      case 'interpret_latest_labs':
        const latestLabs = userContext.biomarkers?.slice(0, 5) || [];
        if (latestLabs.length === 0) {
          return NextResponse.json(
            { error: 'No lab results found. Please upload lab results first.' },
            { status: 404 }
          );
        }
        const biomarkerModule = new BiomarkerInterpretationModule();
        response = await biomarkerModule.interpretLabResults(latestLabs, userContext);
        break;

      case 'design_7_day_meal_plan':
        const nutritionModule2 = new NutritionOptimizationModule();
        response = await nutritionModule2.generateMealPlan(7, userContext);
        break;

      default:
        return NextResponse.json(
          { error: `Unknown quick action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Quick action error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process quick action' },
      { status: 500 }
    );
  }
}


