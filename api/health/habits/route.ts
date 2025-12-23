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
      return NextResponse.json(null);
    }

    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const habits = await prisma.dailyHabits.findFirst({
      where: {
        userId: user.id,
        date: {
          gte: targetDate,
          lt: nextDay,
        },
      },
    });

    return NextResponse.json(habits);
  } catch (error: any) {
    console.error('Error fetching habits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch habits' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, date, ...habitData } = body;

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

    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Find existing or create new
    const existing = await prisma.dailyHabits.findFirst({
      where: {
        userId: user.id,
        date: {
          gte: targetDate,
          lt: nextDay,
        },
      },
    });

    let habits;
    if (existing) {
      habits = await prisma.dailyHabits.update({
        where: { id: existing.id },
        data: {
          ...habitData,
          mealsLogged: habitData.mealsLogged ?? existing.mealsLogged,
        },
      });
    } else {
      // Calculate streak
      const yesterday = new Date(targetDate);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayHabits = await prisma.dailyHabits.findFirst({
        where: {
          userId: user.id,
          date: {
            gte: yesterday,
            lt: targetDate,
          },
        },
      });

      const newStreak = yesterdayHabits ? (yesterdayHabits.streak + 1) : 1;

      habits = await prisma.dailyHabits.create({
        data: {
          userId: user.id,
          date: targetDate,
          ...habitData,
          streak: newStreak,
          mealsLogged: habitData.mealsLogged ?? 0,
        },
      });
    }

    return NextResponse.json({ success: true, habits });
  } catch (error: any) {
    console.error('Error saving habits:', error);
    return NextResponse.json(
      { error: 'Failed to save habits', details: error.message },
      { status: 500 }
    );
  }
}

