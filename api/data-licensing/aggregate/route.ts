import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Type definitions for selected fields
type MealLogSelect = {
  calories: number;
  protein: number;
  carbs: number;
  fats: number | null;
  mealType: string;
  date: Date;
};

type BiomarkerReadingSelect = {
  metric: string | null;
  value: number | null;
  unit: string | null;
  date: Date | null;
};

type BiomarkerStat = {
  name: string;
  count: number;
  avg: number;
  min: number;
  max: number;
};

type MealLogAggregates = {
  totalRecords: number;
  avgCalories: number;
  avgProtein: number;
  avgCarbs: number;
  avgFat: number;
  mealTypeDistribution: Record<string, number>;
};

type BiomarkerAggregates = {
  totalRecords: number;
  uniqueBiomarkers: number;
  statistics: BiomarkerStat[];
};

type AggregatesResponse = {
  totalUsers: number;
  dataType: string | null;
  timestamp: string;
  biomarkers?: BiomarkerAggregates;
  mealLogs?: MealLogAggregates;
};

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

    const userIds = optedInUsers.map((opt: { userId: string }) => opt.userId);
    const aggregates: AggregatesResponse = {
      totalUsers: userIds.length,
      dataType,
      timestamp: new Date().toISOString(),
    };

    // Aggregate biomarkers (anonymized)
    if (!dataType || dataType === 'biomarkers' || dataType === 'all') {
      const biomarkers = await prisma.biomarkerReading.findMany({
        where: { userId: { in: userIds } },
        select: {
          metric: true,
          value: true,
          unit: true,
          date: true,
        },
      }) as BiomarkerReadingSelect[];

      // Group biomarkers by metric and calculate aggregate statistics
      const biomarkerStats: BiomarkerStat[] = [];
      const metricGroups: Record<string, number[]> = {};
      
      biomarkers.forEach((bm) => {
        if (bm.metric && bm.value !== null && bm.value !== undefined && !isNaN(Number(bm.value))) {
          if (!metricGroups[bm.metric]) {
            metricGroups[bm.metric] = [];
          }
          metricGroups[bm.metric].push(Number(bm.value));
        }
      });

      Object.keys(metricGroups).forEach((metric: string) => {
        const values = metricGroups[metric];
        if (values.length > 0) {
          biomarkerStats.push({
            name: metric,
            count: values.length,
            avg: values.reduce((a: number, b: number) => a + b, 0) / values.length,
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
      }) as MealLogSelect[];

      aggregates.mealLogs = {
        totalRecords: mealLogs.length,
        avgCalories: mealLogs.length > 0
          ? mealLogs.reduce((sum: number, m: MealLogSelect) => sum + (m.calories || 0), 0) / mealLogs.length
          : 0,
        avgProtein: mealLogs.length > 0
          ? mealLogs.reduce((sum: number, m: MealLogSelect) => sum + (m.protein || 0), 0) / mealLogs.length
          : 0,
        avgCarbs: mealLogs.length > 0
          ? mealLogs.reduce((sum: number, m: MealLogSelect) => sum + (m.carbs || 0), 0) / mealLogs.length
          : 0,
        avgFat: mealLogs.length > 0
          ? mealLogs.reduce((sum: number, m: MealLogSelect) => sum + (m.fats || 0), 0) / mealLogs.length
          : 0,
        mealTypeDistribution: {} as Record<string, number>,
      };

      // Count meal types
      mealLogs.forEach((m: MealLogSelect) => {
        const type = m.mealType || 'unknown';
        aggregates.mealLogs!.mealTypeDistribution[type] =
          (aggregates.mealLogs!.mealTypeDistribution[type] || 0) + 1;
      });
    }

    // Aggregate microbiome results (commented out - MicrobiomeResult model not in schema)
    // if (!dataType || dataType === 'microbiome' || dataType === 'all') {
    //   const microbiomeResults = await prisma.microbiomeResult.findMany({
    //     where: { userId: { in: userIds } },
    //     select: {
    //       shannonIndex: true,
    //       simpsonIndex: true,
    //       speciesRichness: true,
    //       createdAt: true,
    //     },
    //     take: 5000,
    //   });
    //
    //   aggregates.microbiome = {
    //     totalRecords: microbiomeResults.length,
    //     avgShannonIndex:
    //       microbiomeResults.length > 0
    //         ? microbiomeResults.reduce((sum, m) => sum + (m.shannonIndex || 0), 0) /
    //           microbiomeResults.length
    //         : 0,
    //     avgSimpsonIndex:
    //       microbiomeResults.length > 0
    //         ? microbiomeResults.reduce((sum, m) => sum + (m.simpsonIndex || 0), 0) /
    //           microbiomeResults.length
    //         : 0,
    //     avgSpeciesRichness:
    //       microbiomeResults.length > 0
    //         ? microbiomeResults.reduce((sum, m) => sum + (m.speciesRichness || 0), 0) /
    //           microbiomeResults.length
    //         : 0,
    //   };
    // }

    // Aggregate health assessments (commented out - HealthAssessment model not in schema)
    // if (!dataType || dataType === 'health_assessments' || dataType === 'all') {
    //   const assessments = await prisma.healthAssessment.findMany({
    //     where: { userId: { in: userIds } },
    //     select: {
    //       overallRiskScore: true,
    //       completedAt: true,
    //     },
    //     take: 5000,
    //   });
    //
    //   aggregates.healthAssessments = {
    //     totalRecords: assessments.length,
    //     avgOverallRiskScore:
    //       assessments.length > 0
    //         ? assessments.reduce((sum, a) => sum + (a.overallRiskScore || 0), 0) / assessments.length
    //         : 0,
    //   };
    // }

    return NextResponse.json(aggregates);
  } catch (error) {
    console.error('Error aggregating data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to aggregate data';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

