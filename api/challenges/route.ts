import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const challenges = await prisma.challenge.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(challenges);
  } catch (error: any) {
    console.error('Error fetching challenges:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch challenges' },
      { status: 500 }
    );
  }
}

