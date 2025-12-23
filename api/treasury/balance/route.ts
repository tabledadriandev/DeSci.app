import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Get treasury balance across all currencies
 */
export async function GET() {
  try {
    const balances = await prisma.treasuryBalance.findMany({
      orderBy: { currency: 'asc' },
    });

    // Calculate totals from transactions if balances don't exist
    if (balances.length === 0) {
      const transactions = await prisma.treasuryTransaction.groupBy({
        by: ['currency', 'type'],
        _sum: {
          amount: true,
        },
      });

      const calculatedBalances: Record<string, number> = {};

      for (const tx of transactions) {
        if (!calculatedBalances[tx.currency]) {
          calculatedBalances[tx.currency] = 0;
        }
        if (tx.type === 'revenue' || tx.type === 'dividend') {
          calculatedBalances[tx.currency] += tx._sum.amount || 0;
        } else if (tx.type === 'expense' || tx.type === 'proposal_execution') {
          calculatedBalances[tx.currency] -= tx._sum.amount || 0;
        }
      }

      return NextResponse.json({
        balances: Object.entries(calculatedBalances).map(([currency, balance]) => ({
          currency,
          balance,
        })),
        totalValue: calculatedBalances['TA'] || 0, // Primary currency
      });
    }

    const totalValue = balances.reduce((sum, b) => {
      // For now, just return TA balance as total
      // In production, convert all to a base currency
      return sum + (b.currency === 'TA' ? b.balance : 0);
    }, 0);

    return NextResponse.json({
      balances,
      totalValue,
    });
  } catch (error: any) {
    console.error('Error fetching treasury balance:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch treasury balance' },
      { status: 500 }
    );
  }
}

