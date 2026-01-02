/**
 * Sync All Wearables Endpoint
 * Syncs all connected wearables in one call
 */

import { NextRequest, NextResponse } from 'next/server';
import { syncManager } from '@/lib/wearables/sync-manager';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { userId, providers } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Sync data for last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    // Sync all providers
    const results = await syncManager.syncAll({
      userId,
      providers: providers || ['oura', 'apple', 'google', 'whoop', 'strava', 'fitbit'],
      startDate,
      endDate,
    });

    // Calculate total rewards
    const totalDataPoints = results.reduce((sum: number, r: typeof results[0]) => sum + r.dataPoints, 0);
    const totalReward = totalDataPoints * 0.1; // 0.1 $TA per data point

    // Record DeSci contribution
    if (totalDataPoints > 0) {
      await prisma.deSciContribution.create({
        data: {
          userId,
          dataPoints: totalDataPoints,
          tokenReward: totalReward,
          researchStudy: 'wearable_sync_all',
        },
      });

      // Update user's total tokens
      await prisma.user.update({
        where: { id: userId },
        data: {
          totalTokensEarned: { increment: totalReward },
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        results,
        totalDataPoints,
        totalReward,
      },
    });
  } catch (error) {
    console.error('Sync all error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to sync all wearables';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    // Get all connections
    const connections = await prisma.wearableConnection.findMany({
      where: {
        userId,
        isActive: true,
      },
    });

    return NextResponse.json({
      connections: connections.map(c => ({
        provider: c.provider,
        lastSyncAt: c.lastSyncAt,
        isActive: c.isActive,
      })),
    });
  } catch (error) {
    console.error('Get connections error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to get wearable connections';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
