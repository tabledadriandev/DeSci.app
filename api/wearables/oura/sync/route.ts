/**
 * Oura Ring Sync Endpoint
 * Syncs sleep, HRV, readiness, and activity data from Oura
 */

import { NextRequest, NextResponse } from 'next/server';
import { createOuraClient } from '@/lib/wearables/oura';
import { prisma } from '@/lib/prisma';
import {
  createDeviceAttestationTypedData,
  hashBiomarkerData,
  type DeviceAttestationData,
} from '@/lib/crypto/eip712';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { userId, accessToken } = await request.json();

    if (!userId || !accessToken) {
      return NextResponse.json(
        { error: 'Missing userId or accessToken' },
        { status: 400 }
      );
    }

    const ouraClient = createOuraClient(accessToken);

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

    // Get sleep data
    const sleepData = await ouraClient.getSleepData(startDate, endDate);
    
    // Get HRV data
    const hrvData = await ouraClient.getHRVData(startDate, endDate);
    
    // Get readiness scores
    const readinessPromises = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date(endDate);
      date.setDate(date.getDate() - i);
      readinessPromises.push(ouraClient.getReadinessScore(date));
    }
    const readinessData = (await Promise.all(readinessPromises)).filter(Boolean);
    
    // Get activity data
    const activityData = await ouraClient.getActivityData(startDate, endDate);

    // Store or update wearable connection
    const existing = await prisma.wearableConnection.findFirst({
      where: {
        userId,
        provider: 'oura',
      },
    });

    if (existing) {
      await prisma.wearableConnection.update({
        where: { id: existing.id },
        data: {
          accessToken,
          lastSyncAt: new Date(),
          isActive: true,
        },
      });
    } else {
      await prisma.wearableConnection.create({
        data: {
          userId,
          provider: 'oura',
          accessToken,
          lastSyncAt: new Date(),
          isActive: true,
        },
      });
    }

    // Store biomarker readings
    const biomarkerReadings = [];

    // Store sleep data
    for (const sleep of sleepData) {
      biomarkerReadings.push({
        userId,
        metric: 'sleep_score',
        value: sleep.score,
        unit: 'score',
        source: 'oura',
        date: new Date(sleep.day),
        metadata: {
          totalSleep: sleep.contributors.total_sleep,
          deepSleep: sleep.contributors.deep_sleep,
          remSleep: sleep.contributors.rem_sleep,
          efficiency: sleep.contributors.efficiency,
        },
      });

      biomarkerReadings.push({
        userId,
        metric: 'sleep_duration',
        value: sleep.contributors.total_sleep,
        unit: 'hours',
        source: 'oura',
        date: new Date(sleep.day),
      });
    }

    // Store HRV data
    for (const hrv of hrvData) {
      biomarkerReadings.push({
        userId,
        metric: 'hrv',
        value: hrv.hrv || hrv.rmssd,
        unit: 'ms',
        source: 'oura',
        date: new Date(hrv.timestamp),
        metadata: {
          bpm: hrv.bpm,
          rmssd: hrv.rmssd,
        },
      });
    }

    // Store readiness scores
    for (const readiness of readinessData) {
      if (!readiness || readiness.score === null || readiness.score === undefined) continue;
      biomarkerReadings.push({
        userId,
        metric: 'readiness',
        value: readiness.score,
        unit: 'score',
        source: 'oura',
        date: new Date(readiness.day),
        metadata: {
          contributors: readiness.contributors,
          temperatureDeviation: readiness.temperature_deviation,
        },
      });
    }

    // Store activity data
    for (const activity of activityData) {
      biomarkerReadings.push({
        userId,
        metric: 'steps',
        value: activity.steps,
        unit: 'steps',
        source: 'oura',
        date: new Date(activity.timestamp),
      });

      biomarkerReadings.push({
        userId,
        metric: 'active_calories',
        value: activity.active_calories,
        unit: 'cal',
        source: 'oura',
        date: new Date(activity.timestamp),
      });
    }

    // Bulk insert biomarker readings
    if (biomarkerReadings.length > 0) {
      await prisma.biomarkerReading.createMany({
        data: biomarkerReadings,
        skipDuplicates: true,
      });
    }

    // Calculate token reward
    const dataPoints = biomarkerReadings.length;
    const tokenReward = dataPoints * 0.1; // 0.1 $TA per data point

    // Record DeSci contribution
    await prisma.deSciContribution.create({
      data: {
        userId,
        dataPoints,
        tokenReward,
        researchStudy: 'wearable_sync',
      },
    });

    // Update user's total tokens earned
    await prisma.user.update({
      where: { id: userId },
      data: {
        totalTokensEarned: { increment: tokenReward },
      },
    });

    // Generate EIP-712 attestations for synced data (Phase 2.5)
    const attestations = [];
    const deviceId = 'oura_ring';
    const timestamp = Math.floor(Date.now() / 1000);

    // Create attestations for key metrics
    for (const reading of biomarkerReadings.slice(0, 10)) { // Limit to first 10 for performance
      const dataHash = hashBiomarkerData(
        userId,
        reading.metric,
        reading.value,
        timestamp,
        reading.metadata
      );

      const typedData = createDeviceAttestationTypedData({
        userId,
        deviceId,
        dataHash,
        timestamp,
        metric: reading.metric,
        value: reading.value,
      });

      // Store attestation record (signature will be added by device wallet)
      try {
        await prisma.deviceAttestation.create({
          data: {
            userId,
            deviceId,
            devicePubKey: '', // Will be set when signature is verified
            dataHash,
            signature: '', // Device wallet will sign
            metric: reading.metric,
            value: reading.value,
            timestamp: new Date(timestamp * 1000),
          },
        });

        attestations.push({
          metric: reading.metric,
          dataHash,
          typedData,
        });
      } catch (error) {
        // Skip if attestation already exists
        console.warn(`Attestation already exists for ${reading.metric}`);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        synced: dataPoints,
        reward: tokenReward,
        sleep: sleepData.length,
        hrv: hrvData.length,
        readiness: readinessData.length,
        activity: activityData.length,
        attestations: attestations.length,
        message: attestations.length > 0
          ? `${attestations.length} device attestations created. Sign with device wallet to submit onchain.`
          : undefined,
      },
    });
  } catch (error) {
    console.error('Oura sync error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to sync Oura data';
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

    // Get connection status
    const connection = await prisma.wearableConnection.findFirst({
      where: {
        userId,
        provider: 'oura',
      },
    });

    if (!connection) {
      return NextResponse.json({
        connected: false,
        lastSyncAt: null,
      });
    }

    return NextResponse.json({
      connected: connection.isActive,
      lastSyncAt: connection.lastSyncAt,
    });
  } catch (error) {
    console.error('Oura status error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to get Oura status';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
