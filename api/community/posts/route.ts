import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const posts = await prisma.post.findMany({
      include: {
        user: {
          select: {
            walletAddress: true,
            username: true,
          },
        },
        recipe: true,
        comments: {
          take: 3,
          include: {
            user: {
              select: {
                username: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(posts);
  } catch (error: any) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { address, content, images, recipeId } = await request.json();

    if (!address || !content) {
      return NextResponse.json(
        { error: 'Address and content required' },
        { status: 400 }
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

    // Create post
    const post = await prisma.post.create({
      data: {
        userId: user.id,
        content,
        images: images || [],
        recipeId: recipeId || null,
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
  } catch (error: any) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create post' },
      { status: 500 }
    );
  }
}

