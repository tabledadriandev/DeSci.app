/**
 * Biological Age Calculation API
 * Calculates biological age from wearable data
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateWearableBiologicalAge } from '@/lib/biomarkers/wearableBiologicalAge';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

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

    // Get chronological age (would come from user profile)
    const chronologicalAge = user.biologicalAge 
      ? Math.round((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
      : 40; // Default if not available

    // Get last 90 days of data
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);

    // Get HRV data
    const hrvReadings = await prisma.biomarkerReading.findMany({
      where: {
        userId,
        metric: 'hrv',
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
    });

    // Get sleep data
    const sleepReadings = await prisma.biomarkerReading.findMany({
      where: {
        userId,
        metric: { in: ['sleep_score', 'sleep_duration', 'sleep_efficiency'] },
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
    });

    // Get activity data
    const activityReadings = await prisma.biomarkerReading.findMany({
      where: {
        userId,
        metric: { in: ['steps', 'active_minutes'] },
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
    });

    // Get recovery data
    const recoveryReadings = await prisma.biomarkerReading.findMany({
      where: {
        userId,
        metric: { in: ['recovery', 'readiness'] },
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
    });

    // Transform data for calculator
    const hrvData = hrvReadings.map(r => ({
      value: r.value,
      date: r.date,
    }));

    // Group sleep data by date
    const sleepByDate = new Map<string, any>();
    for (const reading of sleepReadings) {
      const dateKey = reading.date.toISOString().split('T')[0];
      if (!sleepByDate.has(dateKey)) {
        sleepByDate.set(dateKey, { date: reading.date, duration: 0, efficiency: 0, deepSleep: 0, remSleep: 0 });
      }
      const sleep = sleepByDate.get(dateKey);
      if (reading.metric === 'sleep_duration') {
        sleep.duration = reading.value;
      } else if (reading.metric === 'sleep_efficiency') {
        sleep.efficiency = reading.value;
      } else if (reading.metadata && typeof reading.metadata === 'object') {
        const meta = reading.metadata as any;
        sleep.deepSleep = meta.deepSleep || 0;
        sleep.remSleep = meta.remSleep || 0;
      }
    }
    const sleepData = Array.from(sleepByDate.values());

    // Group activity data by date
    const activityByDate = new Map<string, any>();
    for (const reading of activityReadings) {
      const dateKey = reading.date.toISOString().split('T')[0];
      if (!activityByDate.has(dateKey)) {
        activityByDate.set(dateKey, { date: reading.date, steps: 0, activeMinutes: 0 });
      }
      const activity = activityByDate.get(dateKey);
      if (reading.metric === 'steps') {
        activity.steps = reading.value;
      } else if (reading.metric === 'active_minutes') {
        activity.activeMinutes = reading.value;
      }
    }
    const activityData = Array.from(activityByDate.values());

    // Transform recovery data
    const recoveryData = recoveryReadings.map(r => ({
      score: r.value,
      hrvRecovery: (r.metadata as any)?.hrvRecovery || 0,
      date: r.date,
    }));

    // Calculate biological age
    const result = await calculateWearableBiologicalAge(
      hrvData,
      sleepData,
      activityData,
      recoveryData,
      chronologicalAge
    );

    // Store in database
    await prisma.biologicalAge.create({
      data: {
        userId,
        chronologicalAge,
        biologicalAge: result.biologicalAge,
        cardiacAge: result.factors.cardiacAge,
        sleepAge: result.factors.sleepAge,
        activityAge: result.factors.activityAge,
        recoveryAge: result.factors.recoveryAge,
        factors: {
          drivers: result.factors.drivers,
        },
      },
    });

    // Update user's biological age
    await prisma.user.update({
      where: { id: userId },
      data: {
        biologicalAge: result.biologicalAge,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        biologicalAge: result.biologicalAge,
        chronologicalAge,
        factors: result.factors,
        improvement: chronologicalAge - result.biologicalAge,
      },
    });
  } catch (error: any) {
    console.error('Biological age calculation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to calculate biological age' },
      { status: 500 }
    );
  }
}
