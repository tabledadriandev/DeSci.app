import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { address, recipeId, action } = await request.json();

    if (!address || !recipeId) {
      return NextResponse.json(
        { error: 'Address and recipeId required' },
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

    if (action === 'unfavorite') {
      await prisma.recipeFavorite.deleteMany({
        where: { userId: user.id, recipeId },
      });
    } else {
      await prisma.recipeFavorite.upsert({
        where: { userId_recipeId: { userId: user.id, recipeId } },
        update: {},
        create: { userId: user.id, recipeId },
      });
    }

    const count = await prisma.recipeFavorite.count({
      where: { recipeId },
    });

    return NextResponse.json({ success: true, favorites: count });
  } catch (error: any) {
    console.error('Error toggling favorite:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to toggle favorite' },
      { status: 500 },
    );
  }
}


