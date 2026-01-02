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
        imageUrl: images?.[0] || null, // Use first image for imageUrl field
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
      },
    });

    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    console.error('Error creating rich post:', error);
        const errorMessage = error instanceof Error ? error.message : 'Request failed';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}