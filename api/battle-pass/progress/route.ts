import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { walletAddress: address },
    });

    if (!user) {
      return NextResponse.json({ progress: 0, tier: 0 });
    }

    // Get user achievements for XP calculation
    const achievements = await prisma.achievement.findMany({
      where: { userId: user.id },
    });

    // Calculate XP from achievements (each achievement = 10 XP)
    const xp = achievements.length * 10;
    const tier = Math.floor(xp / 100); // 100 XP per tier
    const progress = xp % 100;

    return NextResponse.json({ progress, tier });
  } catch (error: any) {
    console.error('Error fetching battle pass progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}

