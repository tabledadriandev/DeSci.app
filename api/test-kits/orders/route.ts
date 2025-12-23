import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: Get test orders for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ walletAddress: userId }, { email: userId }],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const where: any = { userId: user.id };
    if (status) {
      where.status = status;
    }

    const orders = await prisma.testOrder.findMany({
      where,
      include: {
        kit: {
          select: {
            id: true,
            name: true,
            kitType: true,
            category: true,
            imageUrl: true,
          },
        },
        results: {
          select: {
            id: true,
            testName: true,
            status: true,
            processingCompletedAt: true,
          },
          orderBy: { processingCompletedAt: 'desc' },
        },
      },
      orderBy: { orderDate: 'desc' },
    });

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error: any) {
    console.error('Get test orders error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get test orders' },
      { status: 500 }
    );
  }
}

