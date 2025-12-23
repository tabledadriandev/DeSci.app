/**
 * Latest Biomarkers API
 * Returns most recent biomarker readings for dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

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

    // Get latest readings for each metric
    const metrics = ['hrv', 'sleep_score', 'readiness', 'recovery', 'steps', 'active_minutes'];
    const latestReadings: Record<string, any> = {};

    for (const metric of metrics) {
      const reading = await prisma.biomarkerReading.findFirst({
        where: {
          userId,
          metric,
        },
        orderBy: {
          date: 'desc',
        },
      });

      if (reading) {
        latestReadings[metric] = reading.value;
      }
    }

    // Get latest sleep score
    const sleepReading = await prisma.biomarkerReading.findFirst({
      where: {
        userId,
        metric: 'sleep_score',
      },
      orderBy: { date: 'desc' },
    });

    // Get latest recovery
    const recoveryReading = await prisma.biomarkerReading.findFirst({
      where: {
        userId,
        metric: 'recovery',
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({
      hrv: latestReadings.hrv || null,
      sleepScore: latestReadings.sleep_score || null,
      recovery: latestReadings.recovery || null,
      readiness: latestReadings.readiness || null,
      steps: latestReadings.steps || null,
      activeMinutes: latestReadings.active_minutes || null,
    });
  } catch (error: any) {
    console.error('Latest biomarkers error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch latest biomarkers' },
      { status: 500 }
    );
  }
}
