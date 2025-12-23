import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * POST /api/data-licensing/dividends/distribute
 * Distributes calculated dividends to users.
 * This would typically be called by an admin or automated job.
 */
export async function POST(request: NextRequest) {
  try {
    const { licenseId, period, dryRun } = await request.json();

    // Calculate dividends first
    const calcUrl = new URL('/api/data-licensing/dividends/calculate', request.url);
    if (licenseId) calcUrl.searchParams.set('licenseId', licenseId);
    if (period) calcUrl.searchParams.set('period', period);

    const calcResponse = await fetch(calcUrl.toString());
    const calcData = await calcResponse.json();

    if (!calcResponse.ok || !calcData.dividends || calcData.dividends.length === 0) {
      return NextResponse.json(
        { error: 'No dividends to distribute', data: calcData },
        { status: 400 }
      );
    }

    if (dryRun === true) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        totalDividends: calcData.dividends.reduce((sum: number, d: any) => sum + d.dividendAmount, 0),
        userCount: calcData.dividends.length,
        dividends: calcData.dividends,
        message: 'Dry run - no payments processed',
      });
    }

    // Create dividend payment records
    const payments = await Promise.all(
      calcData.dividends.map((div: any) =>
        prisma.dividendPayment.create({
          data: {
            userId: div.userId,
            sourceType: 'data_licensing',
            sourceId: licenseId || null,
            amount: div.dividendAmount,
            currency: div.currency,
            usdValue: null, // Would be calculated from current $tabledadrian price
            distributionMethod: div.currency === 'TA' ? 'token_transfer' : 'platform_credits',
            status: 'pending', // Would be updated after on-chain transfer
          },
        })
      )
    );

    // In production, this would:
    // 1. Batch transfer $tabledadrian tokens to users' wallets
    // 2. Update payment records with txHash
    // 3. Update user token balances
    // 4. Send notifications

    return NextResponse.json({
      success: true,
      totalDividends: payments.reduce((sum, p) => sum + p.amount, 0),
      userCount: payments.length,
      payments: payments.map((p) => ({
        id: p.id,
        userId: p.userId,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
      })),
      message: 'Dividend payments created. On-chain distribution pending.',
    });
  } catch (error: any) {
    console.error('Error distributing dividends:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to distribute dividends' },
      { status: 500 }
    );
  }
}

