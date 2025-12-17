import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { address, groupId } = await request.json();

    if (!address || !groupId) {
      return NextResponse.json(
        { error: 'Address and groupId are required' },
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

    const db: any = prisma as any;

    await db.groupMember.upsert({
      where: { userId_groupId: { userId: user.id, groupId } },
      update: {},
      create: {
        userId: user.id,
        groupId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error joining group:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to join group' },
      { status: 500 },
    );
  }
}


