/**
 * Advanced Metrics Calculation API
 * Calculates all advanced wellness metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  calculateHRVCoherence,
  calculateSleepDebt,
  calculateParasympatheticTone,
  calculateTrainingResponsiveness,
  calculateMitochondrialProxy,
  calculateCircadianRobustness,
  calculateLongevityScore,
} from '@/lib/metrics/advancedCalculations';

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
        metric: 'sleep_duration',
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
    });

    // Get training/activity data
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

    // Calculate HRV Coherence
    const hrvValues = hrvReadings.map(r => r.value);
    const hrvCoherence = calculateHRVCoherence(hrvValues);

    // Calculate Sleep Debt
    const sleepData = sleepReadings.map(r => ({
      duration: r.value,
      date: r.date,
    }));
    const sleepDebt = calculateSleepDebt(sleepData);

    // Calculate Parasympathetic Tone
    const hrvData = hrvReadings.map(r => ({
      value: r.value,
      date: r.date,
    }));
    const parasympatheticTone = calculateParasympatheticTone(hrvData);

    // Calculate Training Responsiveness (would need training load data)
    // For now, use activity as proxy
    const trainingLoad = activityReadings
      .filter(r => r.metric === 'active_minutes')
      .map(r => r.value);
    const hrvRecovery = hrvReadings.map(r => r.value);
    const trainingResponsiveness = calculateTrainingResponsiveness(trainingLoad, hrvRecovery);

    // Calculate Mitochondrial Proxy (would need recovery speed data)
    // For now, use recovery scores as proxy
    const recoverySpeed = recoveryReadings.map(r => 1 / (r.value / 100)); // Inverse of recovery as speed
    const mitochondrialProxy = calculateMitochondrialProxy(recoverySpeed);

    // Calculate Circadian Robustness (would need sleep schedule data)
    // For now, use sleep duration variance as proxy
    const sleepSchedule = sleepReadings.map(r => ({
      bedtime: new Date(r.date.getTime() - r.value * 60 * 60 * 1000), // Approximate
      wakeTime: r.date,
      date: r.date,
    }));
    const circadianRobustness = calculateCircadianRobustness(sleepSchedule);

    // Calculate Longevity Score
    const avgHRV = hrvValues.length > 0 ? hrvValues.reduce((a, b) => a + b, 0) / hrvValues.length : 50;
    const avgSleep = sleepData.length > 0 ? sleepData.reduce((sum, s) => sum + s.duration, 0) / sleepData.length : 7;
    const avgActivity = activityReadings.length > 0 
      ? activityReadings.reduce((sum, r) => sum + r.value, 0) / activityReadings.length 
      : 5000;
    const avgRecovery = recoveryReadings.length > 0
      ? recoveryReadings.reduce((sum, r) => sum + r.value, 0) / recoveryReadings.length
      : 70;
    const stress = 100 - parasympatheticTone; // Inverse of parasympathetic tone

    const longevityScore = calculateLongevityScore(
      avgHRV,
      (avgSleep / 8) * 100, // Normalize to 0-100
      (avgActivity / 10000) * 100, // Normalize to 0-100
      avgRecovery,
      stress
    );

    // Store advanced metrics
    const metrics = [
      { type: 'hrv_coherence', value: hrvCoherence },
      { type: 'sleep_debt', value: sleepDebt },
      { type: 'parasympathetic_tone', value: parasympatheticTone },
      { type: 'training_responsiveness', value: trainingResponsiveness },
      { type: 'mitochondrial_proxy', value: mitochondrialProxy },
      { type: 'circadian_robustness', value: circadianRobustness },
      { type: 'longevity_score', value: longevityScore.score },
    ];

    await prisma.advancedMetric.createMany({
      data: metrics.map(m => ({
        userId,
        metricType: m.type,
        value: m.value,
        date: new Date(),
      })),
      skipDuplicates: true,
    });

    return NextResponse.json({
      success: true,
      data: {
        hrvCoherence,
        sleepDebt,
        parasympatheticTone,
        trainingResponsiveness,
        mitochondrialProxy,
        circadianRobustness,
        longevityScore,
      },
    });
  } catch (error: any) {
    console.error('Advanced metrics calculation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to calculate advanced metrics' },
      { status: 500 }
    );
  }
}
