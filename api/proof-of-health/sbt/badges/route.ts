/**
 * API Route: Get User's Badges
 * Returns all health badges (SBTs) owned by the user
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromHeader } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromHeader(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const badgeType = searchParams.get('badgeType');

    const where: { userId: string; badgeType?: string } = { userId };
    if (badgeType) {
      where.badgeType = badgeType;
    }

    const badges = await prisma.healthBadge.findMany({
      where,
      orderBy: {
        issuedAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        badges: badges.map((badge: unknown) => {
          const b = badge as { id: string; badgeType: string; tokenId: number | null; mintTxHash: string | null; createdAt: Date; metadata?: unknown };
          return {
            id: b.id,
            badgeType: b.badgeType,
            tokenId: b.tokenId,
            mintTxHash: b.mintTxHash,
            metadata: b.metadata,
            issuedAt: b.createdAt,
            expiresAt: null,
          };
        }),
        total: badges.length,
      },
    });
  } catch (error) {
    console.error('Get badges error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to get badges';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
