import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Unified lab results endpoint
 * Combines data from Biomarker and TestResult models for comprehensive view
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const biomarkerName = searchParams.get('biomarkerName'); // Optional filter for specific biomarker

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ walletAddress: userId }, { email: userId }],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get all biomarkers
    const biomarkers = await prisma.biomarker.findMany({
      where: { userId: user.id },
      orderBy: { recordedAt: 'desc' },
    });

    // Get all test results
    const testResults = await prisma.testResult.findMany({
      where: {
        userId: user.id,
        status: 'completed',
      },
      include: {
        order: {
          include: {
            kit: {
              select: {
                name: true,
                kitType: true,
                category: true,
              },
            },
          },
        },
      },
      orderBy: { processingCompletedAt: 'desc' },
    });

    // Extract biomarker data from test results
    const testResultBiomarkers: any[] = [];
    for (const result of testResults) {
      if (result.biomarkerEntries && Array.isArray(result.biomarkerEntries)) {
        for (const entry of result.biomarkerEntries as any[]) {
          testResultBiomarkers.push({
            ...(entry || {}),
            source: 'test_result',
            testResultId: result.id,
            testName: result.testName,
            testType: result.testType,
            date: result.processingCompletedAt || result.createdAt,
            provider: result.provider,
          });
        }
      }
    }

    // Combine and format all results
    const allResults = [
      ...biomarkers.map((b: any) => ({
        ...b,
        source: 'manual_entry',
        date: b.recordedAt || b.createdAt,
      })),
      ...testResultBiomarkers,
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Calculate trends for each biomarker
    const trends = calculateTrends(allResults, biomarkerName);

    // Color-code status for each biomarker value
    const resultsWithStatus = allResults.map((result) => {
      const statusMap: Record<string, 'optimal' | 'borderline' | 'concerning'> = {};
      
      // Check each biomarker in the result
      const biomarkerFields = [
        'bloodGlucose', 'cholesterolTotal', 'cholesterolLDL', 'cholesterolHDL',
        'triglycerides', 'vitaminD', 'vitaminB12', 'testosterone', 'cortisol',
      ];

      for (const field of biomarkerFields) {
        if (result[field] !== null && result[field] !== undefined) {
          statusMap[field] = getStatus(result[field], field);
        }
      }

      return {
        ...result,
        statusMap,
      };
    });

    return NextResponse.json({
      success: true,
      results: resultsWithStatus,
      trends,
      summary: {
        totalResults: allResults.length,
        totalTestResults: testResults.length,
        totalBiomarkerEntries: biomarkers.length,
        dateRange: {
          earliest: allResults.length > 0 ? allResults[allResults.length - 1].date : null,
          latest: allResults.length > 0 ? allResults[0].date : null,
        },
      },
    });
  } catch (error: any) {
    console.error('Get unified lab results error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get lab results' },
      { status: 500 }
    );
  }
}

/**
 * Calculate trends for biomarkers
 */
function calculateTrends(
  results: any[],
  biomarkerName?: string | null
): Record<string, {
  trend: 'improving' | 'declining' | 'stable' | 'insufficient_data';
  change: number; // Percentage change
  latestValue: number;
  previousValue?: number;
  dataPoints: Array<{ date: string; value: number }>;
}> {
  const trends: Record<string, any> = {};

  // Group results by biomarker field
  const biomarkerFields = [
    'bloodGlucose', 'cholesterolTotal', 'cholesterolLDL', 'cholesterolHDL',
    'triglycerides', 'vitaminD', 'vitaminB12', 'testosterone', 'cortisol',
    'bloodPressureSystolic', 'heartRate',
  ];

  for (const field of biomarkerFields) {
    if (biomarkerName && field !== biomarkerName) continue;

    const dataPoints = results
      .filter(r => r[field] !== null && r[field] !== undefined)
      .map(r => ({
        date: new Date(r.date).toISOString(),
        value: r[field],
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (dataPoints.length < 2) {
      trends[field] = {
        trend: 'insufficient_data',
        change: 0,
        latestValue: dataPoints[0]?.value || 0,
        dataPoints,
      };
      continue;
    }

    const latest = dataPoints[dataPoints.length - 1];
    const previous = dataPoints[dataPoints.length - 2];
    const change = previous.value !== 0
      ? ((latest.value - previous.value) / previous.value) * 100
      : 0;

    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    const threshold = 5; // 5% change threshold

    // For most biomarkers, lower is better (glucose, cholesterol, etc.)
    // For some, higher is better (HDL, vitamin D, etc.)
    const lowerIsBetter = !['cholesterolHDL', 'vitaminD', 'vitaminB12', 'testosterone'].includes(field);

    if (Math.abs(change) > threshold) {
      if (lowerIsBetter) {
        trend = change < 0 ? 'improving' : 'declining';
      } else {
        trend = change > 0 ? 'improving' : 'declining';
      }
    }

    trends[field] = {
      trend,
      change: Math.round(change * 10) / 10,
      latestValue: latest.value,
      previousValue: previous.value,
      dataPoints,
    };
  }

  return trends;
}

/**
 * Get status for a biomarker value
 */
function getStatus(value: number, biomarkerName: string): 'optimal' | 'borderline' | 'concerning' {
  const referenceRanges: Record<string, { min: number; max: number }> = {
    bloodGlucose: { min: 70, max: 100 },
    cholesterolTotal: { min: 0, max: 200 },
    cholesterolLDL: { min: 0, max: 100 },
    cholesterolHDL: { min: 40, max: 200 },
    triglycerides: { min: 0, max: 150 },
    vitaminD: { min: 30, max: 100 },
    vitaminB12: { min: 200, max: 900 },
    testosterone: { min: 300, max: 1000 },
    cortisol: { min: 10, max: 20 },
    bloodPressureSystolic: { min: 90, max: 120 },
    heartRate: { min: 60, max: 100 },
  };

  const range = referenceRanges[biomarkerName];
  if (!range) return 'optimal';

  const { min, max } = range;
  const rangeSize = max - min;
  const optimalMin = min + rangeSize * 0.1;
  const optimalMax = max - rangeSize * 0.1;

  if (value >= optimalMin && value <= optimalMax) return 'optimal';
  if (value >= min && value <= max) return 'borderline';
  return 'concerning';
}

