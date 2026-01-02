import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function calculateNutritionalScore(calories: number, protein: number, carbs: number, fats: number): number {
  // Simple scoring algorithm (0-100)
  // This is a placeholder - implement proper scoring logic
  let score = 50; // Base score
  
  // Adjust based on macronutrient balance
  if (calories > 0) {
    const proteinRatio = (protein * 4) / calories;
    const carbRatio = (carbs * 4) / calories;
    const fatRatio = (fats * 9) / calories;
    
    // Ideal ratios: protein 20-30%, carbs 40-50%, fats 20-30%
    if (proteinRatio >= 0.2 && proteinRatio <= 0.3) score += 10;
    if (carbRatio >= 0.4 && carbRatio <= 0.5) score += 10;
    if (fatRatio >= 0.2 && fatRatio <= 0.3) score += 10;
  }
  
  return Math.min(100, Math.max(0, score));
}
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
      // TODO: Add Food model to Prisma schema
      // const food = item.foodId ? await prisma.food.findUnique({
      //   where: { id: item.foodId },
      // }) : null;

      // For now, use item values directly
      const calories = item.calories || 0;
      const protein = item.protein || 0;
      const carbs = item.carbs || 0;
      const fats = item.fats || 0;

      totalCalories += calories;
      totalProtein += protein;
      totalCarbs += carbs;
      totalFats += fats;

      mealLogItems.push({
        foodId: item.foodId || null,
        foodName: item.foodName || null,
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

    // TODO: Reward model not yet implemented
    // Award tokens directly to user instead
    await prisma.user.update({
      where: { id: user.id },
      data: {
        totalTokensEarned: { increment: 1 }, // 1 token for logging a meal
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
  } catch (error) {
    console.error('Error logging meal:', error);
        const errorMessage = error instanceof Error ? error.message : 'Request failed';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}