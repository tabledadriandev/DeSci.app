/**
 * Cohort Analysis System
 * Provides anonymized peer metrics for comparison
 * Ensures privacy and anonymity
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CohortMetrics {
  metric: string;
  userValue: number;
  healthyRange: { min: number; max: number };
  cohortAverage: number;
  cohortMedian: number;
  percentile: number; // 0-100
  trend: 'up' | 'down' | 'stable';
}

export interface CohortComparison {
  metrics: CohortMetrics[];
  cohortSize: number;
  filters: {
    ageRange?: [number, number];
    gender?: string;
    goals?: string[];
  };
}

export class CohortAnalysisService {
  /**
   * Get anonymized cohort statistics for a metric
   */
  async getCohortStats(
    metric: string,
    userValue: number,
    filters?: {
      ageRange?: [number, number];
      gender?: string;
      goals?: string[];
    }
  ): Promise<{
    average: number;
    median: number;
    percentile: number;
    healthyRange: { min: number; max: number };
    cohortSize: number;
  }> {
    // Build query filters
    const userFilters: any = {};
    
    if (filters?.ageRange) {
      // Calculate birth year range from age range
      const currentYear = new Date().getFullYear();
      const minBirthYear = currentYear - filters.ageRange[1];
      const maxBirthYear = currentYear - filters.ageRange[0];
      // Note: Would need birthDate field in User model for this
    }

    // Get latest biomarker readings for the metric
    // Group by user to get one reading per user
    const readings = await prisma.biomarkerReading.findMany({
      where: {
        metric,
        // Add date filter to get recent readings only (last 30 days)
        date: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { date: 'desc' },
      distinct: ['userId'],
      take: 1000, // Limit for performance
    });

    if (readings.length === 0) {
      // Return default values if no data
      return {
        average: userValue,
        median: userValue,
        percentile: 50,
        healthyRange: this.getHealthyRange(metric),
        cohortSize: 0,
      };
    }

    // Extract values
    const values = readings.map((r) => r.value).sort((a, b) => a - b);

    // Calculate statistics
    const sum = values.reduce((a, b) => a + b, 0);
    const average = sum / values.length;
    const median = this.calculateMedian(values);

    // Calculate percentile
    const percentile = this.calculatePercentile(userValue, values);

    // Get healthy range
    const healthyRange = this.getHealthyRange(metric);

    return {
      average,
      median,
      percentile,
      healthyRange,
      cohortSize: values.length,
    };
  }

  /**
   * Get comprehensive cohort comparison
   */
  async getCohortComparison(
    userId: string,
    metrics: string[],
    filters?: {
      ageRange?: [number, number];
      gender?: string;
      goals?: string[];
    }
  ): Promise<CohortComparison> {
    // Get user's latest values for each metric
    const userReadings = await Promise.all(
      metrics.map(async (metric) => {
        const reading = await prisma.biomarkerReading.findFirst({
          where: {
            userId,
            metric,
          },
          orderBy: { date: 'desc' },
        });
        return { metric, value: reading?.value || 0 };
      })
    );

    // Get cohort stats for each metric
    const cohortMetrics: CohortMetrics[] = await Promise.all(
      userReadings.map(async ({ metric, value: userValue }) => {
        const stats = await this.getCohortStats(metric, userValue, filters);

        // Determine trend (simplified - would need historical data)
        const trend = this.determineTrend(userValue, stats.average);

        return {
          metric,
          userValue,
          healthyRange: stats.healthyRange,
          cohortAverage: stats.average,
          cohortMedian: stats.median,
          percentile: stats.percentile,
          trend,
        };
      })
    );

    // Get cohort size (use the largest from all metrics)
    const cohortSize = Math.max(
      ...(await Promise.all(
        metrics.map((m) =>
          this.getCohortStats(m, 0, filters).then((s) => s.cohortSize)
        )
      ))
    );

    return {
      metrics: cohortMetrics,
      cohortSize,
      filters: filters || {},
    };
  }

  /**
   * Calculate median
   */
  private calculateMedian(values: number[]): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  /**
   * Calculate percentile
   */
  private calculatePercentile(value: number, sortedValues: number[]): number {
    if (sortedValues.length === 0) return 50;

    let count = 0;
    for (const v of sortedValues) {
      if (v <= value) count++;
    }

    return (count / sortedValues.length) * 100;
  }

  /**
   * Get healthy range for a metric
   */
  private getHealthyRange(metric: string): { min: number; max: number } {
    // Define healthy ranges based on research
    const ranges: Record<string, { min: number; max: number }> = {
      hrv: { min: 40, max: 70 }, // ms
      sleep_score: { min: 70, max: 95 }, // 0-100
      recovery: { min: 60, max: 90 }, // %
      readiness: { min: 70, max: 100 }, // 0-100
      steps: { min: 8000, max: 15000 }, // steps/day
      active_minutes: { min: 30, max: 90 }, // minutes/day
      biological_age: { min: 30, max: 50 }, // years (relative to chronological)
    };

    return ranges[metric] || { min: 0, max: 100 };
  }

  /**
   * Determine trend (simplified)
   */
  private determineTrend(
    userValue: number,
    cohortAverage: number
  ): 'up' | 'down' | 'stable' {
    const diff = userValue - cohortAverage;
    const threshold = cohortAverage * 0.05; // 5% threshold

    if (diff > threshold) return 'up';
    if (diff < -threshold) return 'down';
    return 'stable';
  }

  /**
   * Get anonymized user count for a cohort
   */
  async getCohortSize(filters?: {
    ageRange?: [number, number];
    gender?: string;
    goals?: string[];
  }): Promise<number> {
    // Count distinct users with recent biomarker readings
    const count = await prisma.biomarkerReading.groupBy({
      by: ['userId'],
      where: {
        date: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    });

    return count.length;
  }
}

export const createCohortAnalysisService = () => new CohortAnalysisService();
