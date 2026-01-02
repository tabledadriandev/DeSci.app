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

    const where: { type?: string; category?: string; currency?: string } = {};
    if (type) where.type = type;
    if (category) where.category = category;
    if (currency) where.currency = currency;

    // TODO: TreasuryTransaction model not yet implemented
    const transactions: unknown[] = [];
    const total = 0;

    return NextResponse.json({
      transactions,
      pagination: {
        total,
        limit,
        offset,
        hasMore: false,
      },
      summary: {},
    });
  } catch (error: unknown) {
    console.error('Error fetching treasury transactions:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch treasury transactions';
    return NextResponse.json(
      { error: errorMessage },
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

    // TODO: TreasuryTransaction and TreasuryBalance models not yet implemented
    return NextResponse.json(
      { error: 'TreasuryTransaction and TreasuryBalance models not yet implemented' },
      { status: 501 }
    );
  } catch (error: unknown) {
    console.error('Error creating treasury transaction:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create treasury transaction';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

