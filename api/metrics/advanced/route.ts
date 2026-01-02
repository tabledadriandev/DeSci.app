/**
 * Get Advanced Metrics API
 * Returns latest advanced metrics calculations
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

    // Get latest metrics for each type
    const metricTypes = [
      'hrv_coherence',
      'sleep_debt',
      'parasympathetic_tone',
      'training_responsiveness',
      'mitochondrial_proxy',
      'circadian_robustness',
      'longevity_score',
    ];

    const metrics: Record<string, number> = {};

    for (const type of metricTypes) {
      const latest = await prisma.advancedMetric.findFirst({
        where: {
          userId,
          metricType: type,
        },
        orderBy: { calculatedAt: 'desc' },
      });

      if (latest) {
        metrics[type] = latest.value;
      }
    }

    // Get longevity score details if available
    const longevityMetric = await prisma.advancedMetric.findFirst({
      where: {
        userId,
        metricType: 'longevity_score',
      },
      orderBy: { calculatedAt: 'desc' },
    });

    return NextResponse.json({
      hrvCoherence: metrics.hrv_coherence || null,
      sleepDebt: metrics.sleep_debt || null,
      parasympatheticTone: metrics.parasympathetic_tone || null,
      trainingResponsiveness: metrics.training_responsiveness || null,
      mitochondrialProxy: metrics.mitochondrial_proxy || null,
      circadianRobustness: metrics.circadian_robustness || null,
      longevityScore: longevityMetric ? {
        score: longevityMetric.value,
        trajectory: longevityMetric.value >= 80 ? 'EXCELLENT' : longevityMetric.value >= 65 ? 'GOOD' : 'MODERATE',
        prediction: longevityMetric.value >= 80 
          ? 'You\'re aging at 70% speed—on track to live 95+'
          : longevityMetric.value >= 65
          ? 'You\'re aging at 85% speed—on track to live 85-90'
          : 'You\'re aging at 95% speed—focus on key interventions',
      } : null,
    });
  } catch (error) {
    console.error('Get advanced metrics error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch advanced metrics';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
