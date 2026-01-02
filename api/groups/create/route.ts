import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // TODO: Add Group model to Prisma schema
    // const groups = await prisma.group.findMany({
    //   include: {
    //     _count: {
    //       select: { members: true, posts: true },
    //     },
    //   },
    //   orderBy: { createdAt: 'desc' },
    //   take: 50,
    // });

    return NextResponse.json([]);
  } catch (error) {
    console.error('Error fetching groups:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { address, name, description, type, isPrivate } = await request.json();

    if (!address || !name || !type) {
      return NextResponse.json(
        { error: 'Address, name and type are required' },
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

    const slug = `${type}-${name}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    // TODO: Add Group model to Prisma schema
    // const group = await prisma.group.create({
    //   data: {
    //     name,
    //     description: description || '',
    //     type,
    //     isPrivate: !!isPrivate,
    //     slug,
    //     creatorId: user.id,
    //     members: {
    //       create: {
    //         userId: user.id,
    //         role: 'admin',
    //       },
    //     },
    //   },
    // });

    return NextResponse.json({ 
      success: true, 
      data: { 
        id: 'stub',
        name,
        description: description || '',
        type,
        isPrivate: !!isPrivate,
        slug,
        creatorId: user.id,
      } 
    });
  } catch (error) {
    console.error('Error creating group:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create group';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 },
    );
  }
}

