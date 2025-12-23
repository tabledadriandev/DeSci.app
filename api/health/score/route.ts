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

    // Find user
    let user = null;
    try {
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { walletAddress: userId },
            { email: userId },
          ],
        },
      });
    } catch (e) {
      // Database not available
    }

    if (!user) {
      return NextResponse.json({ current: null, history: [] });
    }

    // Get latest health score
    let current = null;
    let history: any[] = [];
    try {
      current = await prisma.healthScore.findFirst({
        where: { userId: user.id },
        orderBy: { date: 'desc' },
      });

      history = await prisma.healthScore.findMany({
        where: { userId: user.id },
        orderBy: { date: 'desc' },
        take: 30,
      });
    } catch (e) {
      // Database not available
    }

    return NextResponse.json({ current, history });
  } catch (error: any) {
    console.error('Error fetching health score:', error);
    return NextResponse.json(
      { error: 'Failed to fetch health score' },
      { status: 500 }
    );
  }
}

