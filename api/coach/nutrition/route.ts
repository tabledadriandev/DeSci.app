import { NextRequest, NextResponse } from 'next/server';
import { NutritionOptimizationModule } from '@/lib/ai-coach/modules';
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
    },
  });

  return {
    profile: user?.profile,
    healthData: user?.healthData || [],
    biomarkers: user?.biomarkers || [],
  };
}

export async function POST(request: NextRequest) {
  try {
    const { userId, action, data } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const userContext = await getUserContext(userId);
    const nutritionModule = new NutritionOptimizationModule();

    let response;

    switch (action) {
      case 'analyze_meal':
        if (!data?.mealData) {
          return NextResponse.json({ error: 'Meal data required' }, { status: 400 });
        }
        response = await nutritionModule.analyzeMeal(data.mealData, userContext);
        break;

      case 'generate_meal_plan':
        const days = data?.days || 7;
        response = await nutritionModule.generateMealPlan(days, userContext);
        break;

      case 'optimize_polyphenols':
        const currentIntake = data?.currentIntake || 0;
        response = await nutritionModule.optimizePolyphenols(currentIntake, userContext);
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Nutrition module error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process nutrition request' },
      { status: 500 }
    );
  }
}

