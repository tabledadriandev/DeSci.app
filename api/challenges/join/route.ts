import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { address, challengeId } = await request.json();

    if (!address || !challengeId) {
      return NextResponse.json(
        { error: 'Address and challenge ID required' },
        { status: 400 }
      );
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { walletAddress: address },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { walletAddress: address },
      });
    }

    // Check if already joined
    const existing = await prisma.challengeProgress.findUnique({
      where: {
        userId_challengeId: {
          userId: user.id,
          challengeId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ success: true, message: 'Already joined' });
    }

    // Create challenge progress
    const progress = await prisma.challengeProgress.create({
      data: {
        userId: user.id,
        challengeId,
        progress: { started: true, completed: 0 },
      },
    });

    return NextResponse.json({ success: true, data: progress });
  } catch (error: any) {
    console.error('Error joining challenge:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to join challenge' },
      { status: 500 }
    );
  }
}

