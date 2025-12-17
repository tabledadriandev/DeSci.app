import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/data-licensing/aggregate
 * Returns anonymized, aggregated health data insights for research licensing.
 * Only includes data from users who have opted in.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dataType = searchParams.get('dataType'); // 'biomarkers', 'meal_logs', 'microbiome', 'health_assessments', 'all'

    // Get all opted-in users
    const optedInUsers = await prisma.dataLicenseOptIn.findMany({
      where: { optedIn: true },
      include: { user: true },
    });

    if (optedInUsers.length === 0) {
      return NextResponse.json({
        totalUsers: 0,
        dataType,
        aggregates: {},
        message: 'No opted-in users found',
      });
    }

    const userIds = optedInUsers.map((opt) => opt.userId);
    const aggregates: any = {
      totalUsers: userIds.length,
      dataType,
      timestamp: new Date().toISOString(),
    };

    // Aggregate biomarkers (anonymized)
    if (!dataType || dataType === 'biomarkers' || dataType === 'all') {
      const biomarkers = await prisma.biomarker.findMany({
        where: { userId: { in: userIds } },
        select: {
          bloodGlucose: true,
          cholesterolTotal: true,
          cholesterolLDL: true,
          cholesterolHDL: true,
          triglycerides: true,
          vitaminD: true,
          vitaminB12: true,
          iron: true,
          ferritin: true,
          weight: true,
          bmi: true,
          bodyFatPercentage: true,
          muscleMass: true,
          recordedAt: true,
        },
      });

      // Calculate aggregate statistics for numeric fields
      const numericFields = [
        'bloodGlucose',
        'cholesterolTotal',
        'cholesterolLDL',
        'cholesterolHDL',
        'triglycerides',
        'vitaminD',
        'vitaminB12',
        'iron',
        'ferritin',
        'weight',
        'bmi',
        'bodyFatPercentage',
        'muscleMass',
      ];

      const biomarkerStats: any[] = [];
      numericFields.forEach((field) => {
        const values = biomarkers
          .map((bm: any) => bm[field])
          .filter((v: any) => v !== null && v !== undefined && !isNaN(Number(v)))
          .map((v: any) => Number(v));

        if (values.length > 0) {
          biomarkerStats.push({
            name: field,
            count: values.length,
            avg: values.reduce((a, b) => a + b, 0) / values.length,
            min: Math.min(...values),
            max: Math.max(...values),
          });
        }
      });

      aggregates.biomarkers = {
        totalRecords: biomarkers.length,
        uniqueBiomarkers: biomarkerStats.length,
        statistics: biomarkerStats,
      };
    }

    // Aggregate meal logs (anonymized nutrition patterns)
    if (!dataType || dataType === 'meal_logs' || dataType === 'all') {
      const mealLogs = await prisma.mealLog.findMany({
        where: { userId: { in: userIds } },
        select: {
          calories: true,
          protein: true,
          carbs: true,
          fats: true,
          mealType: true,
          date: true,
        },
        take: 10000, // Limit for performance
      });

      aggregates.mealLogs = {
        totalRecords: mealLogs.length,
        avgCalories: mealLogs.length > 0
          ? mealLogs.reduce((sum, m) => sum + (m.calories || 0), 0) / mealLogs.length
          : 0,
        avgProtein: mealLogs.length > 0
          ? mealLogs.reduce((sum, m) => sum + (m.protein || 0), 0) / mealLogs.length
          : 0,
        avgCarbs: mealLogs.length > 0
          ? mealLogs.reduce((sum, m) => sum + (m.carbs || 0), 0) / mealLogs.length
          : 0,
        avgFat: mealLogs.length > 0
          ? mealLogs.reduce((sum, m) => sum + (m.fats || 0), 0) / mealLogs.length
          : 0,
        mealTypeDistribution: {} as Record<string, number>,
      };

      // Count meal types
      mealLogs.forEach((m) => {
        const type = m.mealType || 'unknown';
        aggregates.mealLogs.mealTypeDistribution[type] =
          (aggregates.mealLogs.mealTypeDistribution[type] || 0) + 1;
      });
    }

    // Aggregate microbiome results
    if (!dataType || dataType === 'microbiome' || dataType === 'all') {
      const microbiomeResults = await prisma.microbiomeResult.findMany({
        where: { userId: { in: userIds } },
        select: {
          shannonIndex: true,
          simpsonIndex: true,
          speciesRichness: true,
          createdAt: true,
        },
        take: 5000,
      });

      aggregates.microbiome = {
        totalRecords: microbiomeResults.length,
        avgShannonIndex:
          microbiomeResults.length > 0
            ? microbiomeResults.reduce((sum, m) => sum + (m.shannonIndex || 0), 0) /
              microbiomeResults.length
            : 0,
        avgSimpsonIndex:
          microbiomeResults.length > 0
            ? microbiomeResults.reduce((sum, m) => sum + (m.simpsonIndex || 0), 0) /
              microbiomeResults.length
            : 0,
        avgSpeciesRichness:
          microbiomeResults.length > 0
            ? microbiomeResults.reduce((sum, m) => sum + (m.speciesRichness || 0), 0) /
              microbiomeResults.length
            : 0,
      };
    }

    // Aggregate health assessments
    if (!dataType || dataType === 'health_assessments' || dataType === 'all') {
      const assessments = await prisma.healthAssessment.findMany({
        where: { userId: { in: userIds } },
        select: {
          overallRiskScore: true,
          completedAt: true,
        },
        take: 5000,
      });

      aggregates.healthAssessments = {
        totalRecords: assessments.length,
        avgOverallRiskScore:
          assessments.length > 0
            ? assessments.reduce((sum, a) => sum + (a.overallRiskScore || 0), 0) / assessments.length
            : 0,
      };
    }

    return NextResponse.json(aggregates);
  } catch (error: any) {
    console.error('Error aggregating data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to aggregate data' },
      { status: 500 }
    );
  }
}

