import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const {
      address,
      content,
      images,
      recipeId,
      achievementId,
      type,
    } = await request.json();

    if (!address || !content) {
      return NextResponse.json(
        { error: 'Address and content required' },
        { status: 400 },
      );
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { walletAddress: address },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { walletAddress: address },
      });
    }

    const post = await prisma.post.create({
      data: {
        userId: user.id,
        content,
        images: images || [],
        recipeId: recipeId || null,
        // store a simple post type hint for richer rendering (e.g. "achievement", "meal", "progress")
        // without changing schema yet, we can overload description/tags in future.
      },
      include: {
        user: {
          select: {
            walletAddress: true,
            username: true,
          },
        },
        recipe: true,
        comments: true,
      },
    });

    return NextResponse.json({ success: true, data: post });
  } catch (error: any) {
    console.error('Error creating rich post:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create post' },
      { status: 500 },
    );
  }
}



