/**
 * API Route: Mint Streak Badge
 * Mints a badge when user reaches 30/60/90-day streak milestones
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromBody, getUserIdFromHeader } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = getUserIdFromBody(body) || getUserIdFromHeader(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { protocolId, streakLength } = body;

    if (!protocolId || !streakLength) {
      return NextResponse.json(
        { error: 'Missing required fields: protocolId, streakLength' },
        { status: 400 }
      );
    }

    // Determine badge type based on streak
    let badgeType: string;
    if (streakLength >= 90) {
      badgeType = '90_day_adherence';
    } else if (streakLength >= 60) {
      badgeType = '60_day_adherence';
    } else if (streakLength >= 30) {
      badgeType = '30_day_adherence';
    } else {
      return NextResponse.json(
        { error: 'Streak must be at least 30 days' },
        { status: 400 }
      );
    }

    // Check if badge already exists
    const existingBadge = await prisma.healthBadge.findFirst({
      where: {
        userId,
        badgeType,
        metadata: {
          path: ['protocolId'],
          equals: protocolId,
        },
      },
    });

    if (existingBadge) {
      return NextResponse.json(
        { error: 'Badge already minted for this streak' },
        { status: 400 }
      );
    }

    // Create badge
    const badge = await prisma.healthBadge.create({
      data: {
        userId,
        badgeType,
        metadata: {
          protocolId,
          streakLength,
          protocolType: 'temporal_commitment',
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        badgeId: badge.id,
        badgeType,
        streakLength,
        message:
          'Badge created. Submit to HealthBadgeSBT contract to mint onchain.',
      },
    });
  } catch (error) {
    console.error('Mint streak badge error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to mint badge';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
