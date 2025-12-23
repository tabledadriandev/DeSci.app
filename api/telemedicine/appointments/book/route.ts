import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, providerId, startTime, endTime, reason } = body;

    if (!userId || !providerId || !startTime) {
      return NextResponse.json(
        { error: 'userId, providerId and startTime are required' },
        { status: 400 },
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
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 },
      );
    }

    const provider = await prisma.healthcareProvider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 },
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        userId: user.id,
        providerId: provider.id,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        reason: reason ?? null,
        status: 'pending',
      },
    });

    return NextResponse.json({ success: true, appointment });
  } catch (error: any) {
    console.error('Error booking appointment:', error);
    return NextResponse.json(
      { error: 'Failed to book appointment', details: error.message },
      { status: 500 },
    );
  }
}


