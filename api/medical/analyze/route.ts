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
    const biomarkers = (medicalResult.biomarkers as unknown[])
      .map((b: unknown) => {
        const biomarker = b as { name?: string; value?: number; unit?: string; flag?: string };
        return {
          name: biomarker.name || '',
          value: biomarker.value || 0,
          unit: biomarker.unit || '',
          flag: biomarker.flag,
        };
      })
      .filter((b) => b.name !== '' && b.value !== undefined)
      .map((b) => ({
        name: b.name,
        value: b.value,
        unit: b.unit,
        flag: (b.flag === 'high' || b.flag === 'low' || b.flag === 'normal' || b.flag === 'critical') 
          ? (b.flag as 'high' | 'low' | 'normal' | 'critical')
          : undefined,
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
          const biomarkers = result.biomarkers as unknown[];
          const prev = biomarkers.find((b: unknown) => {
            const biomarkerItem = b as { name?: string; value?: number };
            return biomarkerItem.name === biomarker.name;
          }) as { name?: string; value?: number } | undefined;
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
        trend: change > 10 ? 'worsening' as const : change < -10 ? 'improving' as const : 'stable' as const,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        comparisons,
        historicalComparison,
        biomarkers,
      },
    });
  } catch (error) {
    console.error('Medical analysis error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Medical analysis failed';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
