import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/data-licensing/dividends/list
 * Lists dividend payments for a user.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json({ error: 'Address required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { walletAddress: address },
    });

    if (!user) {
      return NextResponse.json({ dividends: [], totalEarned: 0 });
    }

    const dividends = await prisma.dividendPayment.findMany({
      where: { userId: user.id },
      orderBy: { distributionDate: 'desc' },
      take: 100,
    });

    const totalEarned = dividends
      .filter((d: { status: string }) => d.status === 'completed')
      .reduce((sum: number, d: { amount: number }) => sum + d.amount, 0);

    interface DividendPayment {
      id: string;
      amount: number;
      currency: string;
      usdValue: number | null;
      distributionDate: Date;
      status: string;
      txHash: string | null;
      sourceType: string;
    }
    return NextResponse.json({
      dividends: dividends.map((d: DividendPayment) => ({
        id: d.id,
        amount: d.amount,
        currency: d.currency,
        usdValue: d.usdValue,
        distributionDate: d.distributionDate,
        status: d.status,
        txHash: d.txHash,
        sourceType: d.sourceType,
      })),
      totalEarned,
      pendingCount: dividends.filter((d) => d.status === 'pending').length,
    });
  } catch (error) {
    console.error('Error listing dividends:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to list dividends';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

