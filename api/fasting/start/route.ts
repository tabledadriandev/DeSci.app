import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { address, type, startTime } = await request.json();

    if (!address || !type || !startTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Log fasting session (would use FastingSession table in production)
    // For now, log as health data
    await prisma.healthData.create({
      data: {
        userId: user.id,
        type: 'fasting_start',
        value: 1,
        notes: `Fasting type: ${type}`,
        source: 'manual',
        recordedAt: new Date(startTime),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error starting fast:', error);
    return NextResponse.json(
      { error: 'Failed to start fast' },
      { status: 500 }
    );
  }
}

