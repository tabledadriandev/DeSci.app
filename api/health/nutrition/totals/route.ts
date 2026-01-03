import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const date = searchParams.get('date');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { walletAddress: userId },
          { email: userId },
        ],
      },
    });

    if (!user) {
      return NextResponse.json({
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        fiber: 0,
        targets: {
          calories: 2000,
          protein: 150,
          carbs: 250,
          fats: 65,
          fiber: 30,
        },
      });
    }

    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const meals = await prisma.mealLog.findMany({
      where: {
        userId: user.id,
        date: {
          gte: targetDate,
          lt: nextDay,
        },
      },
    });

    const totals = meals.reduce(
      (acc: { calories: number; protein: number; carbs: number; fats: number; fiber: number }, meal: { calories?: number | null; protein?: number | null; carbs?: number | null; fat?: number | null; fats?: number | null; fiber?: number | null }) => ({
        calories: acc.calories + (meal.calories || 0),
        protein: acc.protein + (meal.protein || 0),
        carbs: acc.carbs + (meal.carbs || 0),
        fats: acc.fats + (meal.fat || meal.fats || 0), // Use fat field from schema
        fiber: acc.fiber + (meal.fiber || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 }
    );

    // TODO: UserProfile model not yet implemented in schema
    // Use default targets for now
    const baseCalories = 2000; // Default calorie target

    return NextResponse.json({
      ...totals,
      targets: {
        calories: baseCalories,
        protein: baseCalories * 0.15 / 4, // 15% of calories from protein
        carbs: baseCalories * 0.50 / 4, // 50% from carbs
        fats: baseCalories * 0.30 / 9, // 30% from fats
        fiber: 30,
      },
    });
  } catch (error: unknown) {
    console.error('Error calculating totals:', error);
    return NextResponse.json(
      { error: 'Failed to calculate totals' },
      { status: 500 }
    );
  }
}

