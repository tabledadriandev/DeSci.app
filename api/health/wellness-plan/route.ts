import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { walletAddress: userId },
          { email: userId },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(null);
    }

    const plan = await prisma.wellnessPlan.findFirst({
      where: {
        userId: user.id,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(plan);
  } catch (error: any) {
    console.error('Error fetching wellness plan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wellness plan' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...updateData } = body;

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { walletAddress: userId },
          { email: userId },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const plan = await prisma.wellnessPlan.findFirst({
      where: {
        userId: user.id,
        isActive: true,
      },
    });

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    const updated = await prisma.wellnessPlan.update({
      where: { id: plan.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, plan: updated });
  } catch (error: any) {
    console.error('Error updating wellness plan:', error);
    return NextResponse.json(
      { error: 'Failed to update plan', details: error.message },
      { status: 500 }
    );
  }
}

