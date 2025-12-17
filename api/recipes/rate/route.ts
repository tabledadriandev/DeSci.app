import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { address, recipeId, rating, review } = await request.json();

    if (!address || !recipeId || !rating) {
      return NextResponse.json(
        { error: 'Address, recipeId and rating are required' },
        { status: 400 },
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 },
      );
    }

    let user = await prisma.user.findUnique({
      where: { walletAddress: address },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { walletAddress: address },
      });
    }

    await prisma.recipeRating.upsert({
      where: { userId_recipeId: { userId: user.id, recipeId } },
      update: { rating, review },
      create: { userId: user.id, recipeId, rating, review },
    });

    const aggregate = await prisma.recipeRating.aggregate({
      where: { recipeId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return NextResponse.json({
      success: true,
      averageRating: aggregate._avg.rating,
      ratingCount: aggregate._count.rating,
    });
  } catch (error: any) {
    console.error('Error rating recipe:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to rate recipe' },
      { status: 500 },
    );
  }
}


