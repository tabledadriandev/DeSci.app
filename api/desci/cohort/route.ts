/**
 * API Route: Get cohort comparison data
 */

import { NextRequest, NextResponse } from 'next/server';
import { createCohortAnalysisService } from '@/lib/desci/cohortAnalysis';
import { getUserIdFromHeader } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromHeader(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const metricsParam = searchParams.get('metrics');
    const ageMin = searchParams.get('ageMin');
    const ageMax = searchParams.get('ageMax');
    const gender = searchParams.get('gender');
    const goals = searchParams.get('goals')?.split(',');

    const metrics = metricsParam
      ? metricsParam.split(',')
      : ['hrv', 'sleep_score', 'recovery', 'biological_age'];

    const filters: {
      ageRange?: [number, number];
      gender?: string;
      goals?: string[];
    } = {};
    if (ageMin && ageMax) {
      filters.ageRange = [parseInt(ageMin), parseInt(ageMax)];
    }
    if (gender) {
      filters.gender = gender;
    }
    if (goals && goals.length > 0) {
      filters.goals = goals;
    }

    const cohortService = createCohortAnalysisService();
    const comparison = await cohortService.getCohortComparison(
      userId,
      metrics,
      filters
    );

    return NextResponse.json({
      success: true,
      comparison,
    });
  } catch (error) {
    console.error('Cohort analysis error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Cohort analysis failed';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
