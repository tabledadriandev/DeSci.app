import { NextRequest, NextResponse } from 'next/server';
import { chefEarningsCalculator } from '@/lib/chef/earnings';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: Get chef earnings summary
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chefId = searchParams.get('chefId');

    if (!chefId) {
      return NextResponse.json(
        { error: 'Chef ID required' },
        { status: 400 }
      );
    }

    // Verify chef exists
    const chef = await prisma.chefProfile.findUnique({
      where: { id: chefId },
      select: {
        id: true,
        chefName: true,
        taTokenBalance: true,
        taEarningsTotal: true,
        fiatEarningsTotal: true,
        acceptsCrypto: true,
        acceptsFiat: true,
      },
    });

    if (!chef) {
      return NextResponse.json(
        { error: 'Chef not found' },
        { status: 404 }
      );
    }

    // Calculate earnings summary
    const summary = await chefEarningsCalculator.calculateTotalEarnings(chefId);

    // Get recent earnings transactions
    const recentEarnings = await prisma.chefEarning.findMany({
      where: { chefId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({
      success: true,
      chef: {
        id: chef.id,
        chefName: chef.chefName,
        taTokenBalance: chef.taTokenBalance,
        taEarningsTotal: chef.taEarningsTotal,
        fiatEarningsTotal: chef.fiatEarningsTotal,
      },
      summary,
      recentEarnings,
    });
  } catch (error: any) {
    console.error('Get earnings error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get earnings' },
      { status: 500 }
    );
  }
}

