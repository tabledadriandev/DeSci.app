import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authService } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('sessionToken')?.value;
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await authService.verifySession(sessionToken);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const { dateTime, mealType, items, notes } = await request.json();

    if (!mealType || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate totals
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;

    const mealLogItems = [];

    for (const item of items) {
      let food = null;
      if (item.foodId) {
        // TODO: Add Food model to Prisma schema
        // food = await prisma.food.findUnique({
        //   where: { id: item.foodId },
        // });
        food = null as any;
      }

      const calories = food
        ? (food.calories / 100) * item.amount
        : item.calories || 0;
      const protein = food
        ? (food.protein / 100) * item.amount
        : item.protein || 0;
      const carbs = food
        ? (food.carbs / 100) * item.amount
        : item.carbs || 0;
      const fats = food
        ? (food.fats / 100) * item.amount
        : item.fats || 0;

      totalCalories += calories;
      totalProtein += protein;
      totalCarbs += carbs;
      totalFats += fats;

      mealLogItems.push({
        foodId: item.foodId || null,
        foodName: item.foodName || food?.name || null,
        amount: item.amount,
        unit: item.unit || 'grams',
        calories,
        protein,
        carbs,
        fats,
      });
    }

    // Calculate nutritional score (0-100)
    const nutritionalScore = calculateNutritionalScore(
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFats
    );

    // TODO: Add MealLog and UserProgress models to Prisma schema
    // Create meal log
    // const mealLog = await prisma.mealLog.create({
    //   data: {
    //     userId: user.id,
    //     dateTime: dateTime ? new Date(dateTime) : new Date(),
    //     mealType,
    //     totalCalories,
    //     totalProtein,
    //     totalCarbs,
    //     totalFats,
    //     nutritionalScore,
    //     notes: notes || null,
    //     items: {
    //       create: mealLogItems,
    //     },
    //   },
    //   include: { items: true },
    // });

    // Update user progress
    // await prisma.userProgress.upsert({
    //   where: { userId: user.id },
    //   update: {
    //     totalMealsLogged: { increment: 1 },
    //   },
    //   create: {
    //     userId: user.id,
    //     totalMealsLogged: 1,
    //   },
    // });

    // Award reward
    await prisma.reward.create({
      data: {
        userId: user.id,
        type: 'meal_logged',
        amount: 1, // 1 TA token
        description: 'Logged a meal',
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        tokenBalance: { increment: 1 },
      },
    });

    // Mock meal log response until schema is updated
    const mealLog = {
      id: 'temp-' + Date.now(),
      userId: user.id,
      dateTime: dateTime ? new Date(dateTime) : new Date(),
      mealType,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFats,
      nutritionalScore,
      notes: notes || null,
      items: mealLogItems,
    };

    return NextResponse.json({ success: true, data: mealLog });
  } catch (error: any) {
    console.error('Error logging meal:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to log meal' },
      { status: 500 }
    );
  }
}

// Helper function to calculate nutritional score
function calculateNutritionalScore(
  calories: number,
  protein: number,
  carbs: number,
  fats: number
): number {
  // Simple scoring algorithm
  // In production, would use more sophisticated nutrition science
  let score = 50; // Base score

  // Protein bonus (up to +20)
  if (protein > 20) score += 10;
  if (protein > 30) score += 10;

  // Balance bonus (up to +20)
  const proteinRatio = protein / (protein + carbs + fats * 9);
  if (proteinRatio > 0.2 && proteinRatio < 0.4) score += 10;
  if (proteinRatio > 0.25 && proteinRatio < 0.35) score += 10;

  // Fat quality (up to +10)
  // Would check for healthy vs unhealthy fats in production

  return Math.min(100, Math.max(0, score));
}

