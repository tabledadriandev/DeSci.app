/**
 * Medical Analysis API
 * Compares biomarkers to healthy ranges, historical baseline, and research-backed optimal ranges
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { medicalExtractionClient } from '@/lib/ai/medicalExtraction';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { medicalResultId, userId } = await request.json();

    if (!medicalResultId || !userId) {
      return NextResponse.json(
        { error: 'Missing medicalResultId or userId' },
        { status: 400 }
      );
    }

    // Get medical result
    const medicalResult = await prisma.medicalResult.findUnique({
      where: { id: medicalResultId },
    });

    if (!medicalResult || medicalResult.userId !== userId) {
      return NextResponse.json(
        { error: 'Medical result not found' },
        { status: 404 }
      );
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get historical baseline (previous tests)
    const previousResults = await prisma.medicalResult.findMany({
      where: {
        userId,
        testType: medicalResult.testType,
        id: { not: medicalResultId },
      },
      orderBy: { testDate: 'desc' },
      take: 5,
    });

    // Parse biomarkers from stored data
    const biomarkers = (medicalResult.biomarkers as any[]).map((b: any) => ({
      name: b.name,
      value: b.value,
      unit: b.unit,
      flag: b.flag,
    }));

    // Compare to healthy ranges
    const comparisons = await medicalExtractionClient.compareToRanges(
      biomarkers,
      user.biologicalAge || 40,
      'unknown' // Would get from user profile
    );

    // Compare to historical baseline
    const historicalComparison = biomarkers.map(biomarker => {
      const previousValues = previousResults
        .map(result => {
          const biomarkers = result.biomarkers as any[];
          const prev = biomarkers.find((b: any) => b.name === biomarker.name);
          return prev ? prev.value : null;
        })
        .filter((v): v is number => v !== null);

      if (previousValues.length === 0) {
        return {
          biomarker: biomarker.name,
          current: biomarker.value,
          previous: null,
          change: null,
          trend: 'no_data' as const,
        };
      }

      const previousAvg = previousValues.reduce((a, b) => a + b, 0) / previousValues.length;
      const change = ((biomarker.value - previousAvg) / previousAvg) * 100;

      return {
        biomarker: biomarker.name,
        current: biomarker.value,
        previous: previousAvg,
        change,
        trend: change > 5 ? 'improving' : change < -5 ? 'declining' : 'stable',
      };
    });

    // Flag anomalies
    const flagged = await medicalExtractionClient.flagAnomalies(biomarkers);

    // Generate recommendations
    const recommendations = comparisons
      .filter(c => c.status === 'concerning' || c.status === 'suboptimal')
      .map(c => c.recommendation)
      .filter((r): r is string => r !== undefined);

    return NextResponse.json({
      success: true,
      data: {
        comparisons,
        historicalComparison,
        flagged,
        recommendations,
        improvementRate: historicalComparison
          .filter(h => h.change !== null && h.change < 0) // Negative change = improvement for most metrics
          .length,
      },
    });
  } catch (error: any) {
    console.error('Medical analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze medical results' },
      { status: 500 }
    );
  }
}
