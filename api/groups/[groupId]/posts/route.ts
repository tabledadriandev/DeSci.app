import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  context: { params: { groupId: string } },
) {
  try {
    const { groupId } = context.params;

    const posts = await prisma.forumPost.findMany({
      where: { groupId },
      include: {
        user: {
          select: { username: true, walletAddress: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(posts);
  } catch (error: any) {
    console.error('Error fetching forum posts:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch posts' },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: { groupId: string } },
) {
  try {
    const { groupId } = context.params;
    const { address, title, content } = await request.json();

    if (!address || !title || !content) {
      return NextResponse.json(
        { error: 'Address, title and content are required' },
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

    const post = await prisma.forumPost.create({
      data: {
        groupId,
        userId: user.id,
        title,
        content,
      },
      include: {
        user: {
          select: { username: true, walletAddress: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: post });
  } catch (error: any) {
    console.error('Error creating forum post:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create post' },
      { status: 500 },
    );
  }
}


