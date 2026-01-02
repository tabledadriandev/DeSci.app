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
            biomarkerReadings: { take: 10, orderBy: { date: 'desc' } },
      mealLogs: { take: 5, orderBy: { createdAt: 'desc' } },
    },
  });

  return {
    biomarkers: user?.biomarkerReadings || [],
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
    let result: unknown;

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
        const mealData = {
          ...lastMeal,
          foods: lastMeal.foods as unknown,
          aiIdentified: lastMeal.aiIdentified as unknown,
        } as {
          foods?: unknown[];
          calories?: number;
          protein?: number;
          carbs?: number;
          fat?: number;
          [key: string]: unknown;
        };
        result = await nutritionModule.analyzeMeal(mealData, userContext);
        break;

      case 'generate_workout_today':
        const fitnessModule = new FitnessMovementModule();
        const goals = ['General fitness']; // Health goals can be extracted from user preferences if needed
        result = await fitnessModule.generateWorkoutPlan(goals, userContext, 1);
        break;

      case 'improve_sleep_tonight':
        const sleepModule = new SleepOptimizationModule();
        result = await sleepModule.designBedtimeRoutine(userContext);
        break;

      case 'reduce_stress_now':
        const stressModule = new StressMentalWellnessModule();
        result = await stressModule.designBreathworkProtocol('stress_reduction', userContext);
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
        // Transform array to LabResults format
        const labResults = latestLabs.reduce((acc: Record<string, unknown>, lab: unknown) => {
          const labObj = lab as { metric?: string; value?: number; unit?: string; referenceRange?: string; flag?: string };
          if (labObj.metric) {
            acc[labObj.metric] = {
              value: labObj.value,
              unit: labObj.unit,
              referenceRange: labObj.referenceRange,
              flag: labObj.flag,
            };
          }
          return acc;
        }, {}) as {
          [key: string]: {
            value: number;
            unit: string;
            referenceRange?: string;
            flag?: string;
          } | unknown;
        };
        result = await biomarkerModule.interpretLabResults(labResults, userContext);
        break;

      case 'design_7_day_meal_plan':
        const nutritionModule2 = new NutritionOptimizationModule();
        result = await nutritionModule2.generateMealPlan(7, userContext);
        break;

      default:
        return NextResponse.json(
          { error: `Unknown quick action: ${action}` },
          { status: 400 }
        );
    }

    // Normalize response format - modules may return different structures
    const response = typeof result === 'string' 
      ? result 
      : (result && typeof result === 'object' && 'response' in result && typeof result.response === 'string')
        ? result.response
        : (result && typeof result === 'object' && 'message' in result && typeof result.message === 'string')
          ? result.message
          : (result && typeof result === 'object' && 'content' in result && typeof result.content === 'string')
            ? result.content
            : JSON.stringify(result);

    return NextResponse.json({ 
      response,
      success: true,
      action,
    });
  } catch (error) {
    console.error('Quick action error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Request failed';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}