import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

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
      return NextResponse.json({ days: [], completedDays: 0, totalDays: 7 });
    }

    // Get last 7 days
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);

    const habits = await prisma.dailyHabits.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });

    const days = [];
    let completedDays = 0;
    const waterValues: number[] = [];
    const stepValues: number[] = [];
    let exerciseDays = 0;

    for (let i = 6; i >= 0; i--) {
      const date = new Date(endDate);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayHabits = habits.find((h: any) => h.date.toISOString().split('T')[0] === dateStr);
      const completed = dayHabits && (
        ((dayHabits as any).waterIntake && (dayHabits as any).waterIntake >= 2) ||
        ((dayHabits as any).steps && (dayHabits as any).steps >= 5000) ||
        dayHabits.exerciseCompleted
      );

      if (completed) completedDays++;

      if (dayHabits?.waterIntake) waterValues.push(dayHabits.waterIntake);
      if (dayHabits?.steps) stepValues.push(dayHabits.steps);
      if (dayHabits?.exerciseCompleted) exerciseDays++;

      days.push({
        date: date.getDate().toString(),
        completed: !!completed,
      });
    }

    return NextResponse.json({
      days,
      completedDays,
      totalDays: 7,
      avgWater: waterValues.length > 0
        ? waterValues.reduce((a, b) => a + b, 0) / waterValues.length
        : 0,
      avgSteps: stepValues.length > 0
        ? stepValues.reduce((a, b) => a + b, 0) / stepValues.length
        : 0,
      exerciseDays,
    });
  } catch (error: any) {
    console.error('Error fetching weekly summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weekly summary' },
      { status: 500 }
    );
  }
}

