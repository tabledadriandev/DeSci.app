import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { address, endTime } = await request.json();

    if (!address || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { walletAddress: address },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Log fasting end
    await prisma.healthData.create({
      data: {
        userId: user.id,
        type: 'fasting_end',
        value: 1,
        source: 'manual',
        recordedAt: new Date(endTime),
      },
    });

    // Award reward
    await prisma.reward.create({
      data: {
        userId: user.id,
        type: 'fasting_completed',
        amount: 5, // 5 TA tokens
        description: 'Completed fasting session',
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        tokenBalance: { increment: 5 },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error ending fast:', error);
    return NextResponse.json(
      { error: 'Failed to end fast' },
      { status: 500 }
    );
  }
}

