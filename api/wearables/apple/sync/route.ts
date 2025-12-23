/**
 * Apple HealthKit Sync Endpoint
 * Accepts HealthKit export file upload and syncs data
 */

import { NextRequest, NextResponse } from 'next/server';
import { appleHealthKitParser } from '@/lib/wearables/apple-healthkit';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file || !userId) {
      return NextResponse.json(
        { error: 'Missing file or userId' },
        { status: 400 }
      );
    }

    // Parse HealthKit export
    const healthData = await appleHealthKitParser.extractFromFile(file);

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

    // Store or update connection
    await prisma.wearableConnection.upsert({
      where: {
        userId_provider: {
          userId,
          provider: 'apple',
        },
      },
      create: {
        userId,
        provider: 'apple',
        accessToken: 'file-upload', // HealthKit uses file upload, not OAuth token
        lastSyncAt: new Date(),
        isActive: true,
      },
      update: {
        lastSyncAt: new Date(),
        isActive: true,
      },
    });

    // Store biomarker readings
    const biomarkerReadings = [];

    if (healthData.steps) {
      biomarkerReadings.push({
        userId,
        metric: 'steps',
        value: healthData.steps,
        unit: 'steps',
        source: 'apple',
        date: new Date(),
      });
    }

    if (healthData.heartRate) {
      biomarkerReadings.push({
        userId,
        metric: 'heart_rate_resting',
        value: healthData.heartRate.resting,
        unit: 'bpm',
        source: 'apple',
        date: new Date(),
      });
    }

    if (healthData.sleep) {
      biomarkerReadings.push({
        userId,
        metric: 'sleep_duration',
        value: healthData.sleep.duration,
        unit: 'hours',
        source: 'apple',
        date: healthData.sleep.startDate,
        metadata: {
          startDate: healthData.sleep.startDate,
          endDate: healthData.sleep.endDate,
        },
      });
    }

    // Bulk insert
    if (biomarkerReadings.length > 0) {
      await prisma.biomarkerReading.createMany({
        data: biomarkerReadings,
        skipDuplicates: true,
      });
    }

    // Calculate token reward
    const dataPoints = biomarkerReadings.length;
    const tokenReward = dataPoints * 0.1;

    // Record DeSci contribution
    await prisma.desciContribution.create({
      data: {
        userId,
        dataPoints,
        tokenReward,
        researchStudy: 'wearable_sync',
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        synced: dataPoints,
        reward: tokenReward,
      },
    });
  } catch (error: any) {
    console.error('Apple HealthKit sync error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync Apple Health data' },
      { status: 500 }
    );
  }
}
