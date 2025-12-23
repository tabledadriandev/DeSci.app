/**
 * Google Fit Sync Endpoint
 * Syncs steps, heart rate, activity, and sleep data
 */

import { NextRequest, NextResponse } from 'next/server';
import { createGoogleFitClient } from '@/lib/wearables/google-fit';
import { prisma } from '@/lib/prisma';

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

    const googleFitClient = createGoogleFitClient(accessToken);

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

    // Get steps
    const steps = await googleFitClient.getSteps(startDate, endDate);
    
    // Get heart rate
    const heartRateData = await googleFitClient.getHeartRate(startDate, endDate);
    
    // Get activities
    const activities = await googleFitClient.getActivities(startDate, endDate);
    
    // Get sleep
    const sleepData = await googleFitClient.getSleep(startDate, endDate);

    // Store connection
    await prisma.wearableConnection.upsert({
      where: {
        userId_provider: {
          userId,
          provider: 'google',
        },
      },
      create: {
        userId,
        provider: 'google',
        accessToken,
        lastSyncAt: new Date(),
        isActive: true,
      },
      update: {
        accessToken,
        lastSyncAt: new Date(),
        isActive: true,
      },
    });

    // Store biomarker readings
    const biomarkerReadings = [];

    if (steps > 0) {
      biomarkerReadings.push({
        userId,
        metric: 'steps',
        value: steps,
        unit: 'steps',
        source: 'google',
        date: new Date(),
      });
    }

    if (heartRateData.length > 0) {
      const avgHR = heartRateData.reduce((sum, hr) => sum + hr.value, 0) / heartRateData.length;
      const minHR = Math.min(...heartRateData.map(hr => hr.value));
      const maxHR = Math.max(...heartRateData.map(hr => hr.value));

      biomarkerReadings.push({
        userId,
        metric: 'heart_rate_resting',
        value: minHR,
        unit: 'bpm',
        source: 'google',
        date: new Date(),
        metadata: {
          average: avgHR,
          max: maxHR,
        },
      });
    }

    if (sleepData.length > 0) {
      for (const sleep of sleepData) {
        const duration = (parseInt(sleep.endTimeMillis) - parseInt(sleep.startTimeMillis)) / (1000 * 60 * 60);
        biomarkerReadings.push({
          userId,
          metric: 'sleep_duration',
          value: duration,
          unit: 'hours',
          source: 'google',
          date: new Date(parseInt(sleep.startTimeMillis)),
        });
      }
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
        steps,
        heartRate: heartRateData.length,
        activities: activities.length,
        sleep: sleepData.length,
      },
    });
  } catch (error: any) {
    console.error('Google Fit sync error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync Google Fit data' },
      { status: 500 }
    );
  }
}
