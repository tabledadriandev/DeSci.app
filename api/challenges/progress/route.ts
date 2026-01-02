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
      return NextResponse.json({});
    }

    const progress = await prisma.challengeProgress.findMany({
      where: { userId: user.id },
    });

    const progressMap: Record<string, unknown> = {};
    progress.forEach((p: typeof progress[0]) => {
      const progressItem = p as { challengeId: string };
      progressMap[progressItem.challengeId] = p;
    });

    return NextResponse.json(progressMap);
  } catch (error) {
    console.error('Error fetching challenge progress:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch challenge progress';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
