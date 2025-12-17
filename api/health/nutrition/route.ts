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
      return NextResponse.json([]);
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
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(meals);
  } catch (error: any) {
    console.error('Error fetching meal logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meal logs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, date, imageUrl, foodsIdentified, ...mealData } = body;

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { walletAddress: userId },
          { email: userId },
        ],
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          walletAddress: userId.startsWith('0x') ? userId : `0x${Buffer.from(userId).toString('hex').slice(0, 40).padStart(40, '0')}`,
          email: userId.includes('@') ? userId : null,
        },
      });
    }

    const meal = await prisma.mealLog.create({
      data: {
        userId: user.id,
        date: date ? new Date(date) : new Date(),
        mealType: mealData.mealType,
        imageUrl: imageUrl,
        foodsIdentified: foodsIdentified || [],
        foods: mealData.foods || [],
        calories: mealData.calories || 0,
        protein: mealData.protein || 0,
        carbs: mealData.carbs || 0,
        fats: mealData.fats || 0,
        fiber: mealData.fiber || 0,
        notes: mealData.notes,
      },
    });

    return NextResponse.json({ success: true, meal });
  } catch (error: any) {
    console.error('Error saving meal log:', error);
    return NextResponse.json(
      { error: 'Failed to save meal log', details: error.message },
      { status: 500 }
    );
  }
}

