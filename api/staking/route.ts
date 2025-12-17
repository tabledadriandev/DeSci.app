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

    return NextResponse.json({
      stakedAmount: user?.stakedAmount || 0,
      tokenBalance: user?.tokenBalance || 0,
    });
  } catch (error: any) {
    console.error('Error fetching staking info:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch staking info' },
      { status: 500 }
    );
  }
}

