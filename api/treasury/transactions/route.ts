import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Get treasury transactions with filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const currency = searchParams.get('currency');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    if (type) where.type = type;
    if (category) where.category = category;
    if (currency) where.currency = currency;

    const [transactions, total] = await Promise.all([
      prisma.treasuryTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          proposal: {
            select: {
              id: true,
              title: true,
              type: true,
            },
          },
        },
      }),
      prisma.treasuryTransaction.count({ where }),
    ]);

    // Calculate summary statistics
    const summary = await prisma.treasuryTransaction.groupBy({
      by: ['type', 'currency'],
      _sum: {
        amount: true,
      },
    });

    return NextResponse.json({
      transactions,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
      summary: summary.reduce((acc, s) => {
        const key = `${s.type}_${s.currency}`;
        acc[key] = s._sum.amount || 0;
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (error: any) {
    console.error('Error fetching treasury transactions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch treasury transactions' },
      { status: 500 }
    );
  }
}

/**
 * Create a treasury transaction (for revenue/expense tracking)
 */
export async function POST(request: NextRequest) {
  try {
    const { type, category, amount, currency, description, proposalId, txHash, metadata } =
      await request.json();

    if (!type || !amount || !currency || !description) {
      return NextResponse.json(
        { error: 'Type, amount, currency, and description required' },
        { status: 400 }
      );
    }

    // Create transaction
    const transaction = await prisma.treasuryTransaction.create({
      data: {
        type,
        category,
        amount: parseFloat(amount),
        currency,
        description,
        proposalId,
        txHash,
        metadata,
      },
    });

    // Update treasury balance
    const balance = await prisma.treasuryBalance.findUnique({
      where: { currency },
    });

    const amountChange = type === 'revenue' || type === 'dividend' 
      ? parseFloat(amount) 
      : -parseFloat(amount);

    if (balance) {
      await prisma.treasuryBalance.update({
        where: { currency },
        data: {
          balance: { increment: amountChange },
        },
      });
    } else {
      await prisma.treasuryBalance.create({
        data: {
          currency,
          balance: Math.max(0, amountChange),
        },
      });
    }

    return NextResponse.json({ success: true, transaction });
  } catch (error: any) {
    console.error('Error creating treasury transaction:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create treasury transaction' },
      { status: 500 }
    );
  }
}

