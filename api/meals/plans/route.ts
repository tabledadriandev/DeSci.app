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
      return NextResponse.json([]);
    }

    const mealPlans = await prisma.mealPlan.findMany({
      where: { userId: user.id },
      include: { meals: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(mealPlans);
  } catch (error: any) {
    console.error('Error fetching meal plans:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch meal plans' },
      { status: 500 }
    );
  }
}

