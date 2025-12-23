import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest) {
  try {
    // Highest microbiota diversity (Shannon Index)
    const microbiotaLeaders = await prisma.microbiomeResult.groupBy({
      by: ['userId'],
      _max: {
        shannonIndex: true,
      },
      orderBy: {
        _max: {
          shannonIndex: 'desc',
        },
      },
      take: 10,
    });

    // Longest daily habit streaks
    const streakLeaders = await prisma.dailyHabits.groupBy({
      by: ['userId'],
      _max: {
        streak: true,
      },
      orderBy: {
        _max: {
          streak: 'desc',
        },
      },
      take: 10,
    });

    // Basic user info to show anonymized labels
    const userIds = Array.from(
      new Set([...microbiotaLeaders.map((m) => m.userId), ...streakLeaders.map((s) => s.userId)]),
    );
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        username: true,
        walletAddress: true,
      },
    });

    const userLabel = (id: string) => {
      const u = users.find((x) => x.id === id);
      if (!u) return 'User';
      if (u.username) return u.username;
      if (u.walletAddress) {
        return `${u.walletAddress.slice(0, 4)}…${u.walletAddress.slice(-4)}`;
      }
      return 'User';
    };

    return NextResponse.json({
      success: true,
      microbiotaDiversity: microbiotaLeaders.map((entry, index) => ({
        rank: index + 1,
        userId: entry.userId,
        label: userLabel(entry.userId),
        shannonIndex: entry._max.shannonIndex,
      })),
      longestStreaks: streakLeaders.map((entry, index) => ({
        rank: index + 1,
        userId: entry.userId,
        label: userLabel(entry.userId),
        streak: entry._max.streak,
      })),
    });
  } catch (error: any) {
    console.error('Error building leaderboards:', error);
    return NextResponse.json(
      { error: 'Failed to load leaderboards', details: error.message },
      { status: 500 },
    );
  }
}


