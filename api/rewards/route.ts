import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { address, type, amount, description } = await request.json();

    if (!address || !type || !amount) {
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

    // Create reward
    const reward = await prisma.reward.create({
      data: {
        userId: user.id,
        type,
        amount: parseFloat(amount),
        description: description || `Reward for ${type}`,
      },
    });

    // Update user token balance
    await prisma.user.update({
      where: { id: user.id },
      data: {
        tokenBalance: {
          increment: parseFloat(amount),
        },
      },
    });

    return NextResponse.json({ success: true, data: reward });
  } catch (error: any) {
    console.error('Error creating reward:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create reward' },
      { status: 500 }
    );
  }
}

