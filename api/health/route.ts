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

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { walletAddress: address },
    });

    if (!user) {
      return NextResponse.json([]);
    }

    // Get health data
    const healthData = await prisma.healthData.findMany({
      where: { userId: user.id },
      orderBy: { recordedAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(healthData);
  } catch (error: any) {
    console.error('Error fetching health data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch health data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, type, value, unit, notes, source } = body;

    if (!address || !type || value === undefined) {
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
        data: {
          walletAddress: address,
        },
      });
    }

    // Create health data entry
    const healthData = await prisma.healthData.create({
      data: {
        userId: user.id,
        type,
        value: parseFloat(value),
        unit: unit || '',
        notes: notes || '',
        source: source || 'manual',
      },
    });

    return NextResponse.json({ success: true, data: healthData });
  } catch (error: any) {
    console.error('Error creating health data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create health data' },
      { status: 500 }
    );
  }
}

