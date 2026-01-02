import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { address, tierId, billing, price } = await request.json();

    if (!address || !tierId) {
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

    // In production, would:
    // 1. Process payment (Stripe, crypto, etc.)
    // 2. Create subscription record
    // 3. Update user subscription tier
    // 4. Send confirmation email

    return NextResponse.json({
      success: true,
      message: 'Subscription activated!',
    });
  } catch (error) {
    console.error('Error subscribing:', error);
        const errorMessage = error instanceof Error ? error.message : 'Request failed';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}