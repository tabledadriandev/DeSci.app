/**
 * Database Query Optimization
 * Utilities for optimizing database queries and preventing N+1 problems
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Fetch user with all related data in a single query
 * Prevents N+1 queries
 */
export async function getUserWithRelations(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      biomarkerReadings: {
        take: 30,
        orderBy: { date: 'desc' },
      },
      protocolExperiments: {
        where: { status: 'active' },
        take: 5,
      },
      mealLogs: {
        take: 7,
        orderBy: { date: 'desc' },
      },
      medicalResults: {
        take: 5,
        orderBy: { testDate: 'desc' },
      },
      achievements: {
        take: 10,
        orderBy: { unlockedAt: 'desc' },
      },
    },
  });
}

/**
 * Batch fetch biomarker readings for multiple users
 */
export async function batchFetchBiomarkers(
  userIds: string[],
  metric: string,
  days: number = 30
) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return prisma.biomarkerReading.findMany({
    where: {
      userId: { in: userIds },
      metric,
      date: { gte: startDate },
    },
    orderBy: { date: 'desc' },
  });
}

/**
 * Get latest biomarker values for dashboard (optimized)
 */
export async function getLatestBiomarkersOptimized(userId: string) {
  // Use raw query for better performance
  const metrics = ['hrv', 'sleep_score', 'recovery', 'readiness', 'steps', 'active_minutes'];
  
  const results = await Promise.all(
    metrics.map(async (metric) => {
      return prisma.biomarkerReading.findFirst({
        where: { userId, metric },
        orderBy: { date: 'desc' },
        select: {
          value: true,
          date: true,
          source: true,
        },
      });
    })
  );

  return results.filter(Boolean);
}

/**
 * Cache key generators for consistent caching
 */
export const cacheKeys = {
  userBiomarkers: (userId: string) => `user:${userId}:biomarkers`,
  userProtocols: (userId: string) => `user:${userId}:protocols`,
  cohortStats: (metric: string, filters: string) => `cohort:${metric}:${filters}`,
  biologicalAge: (userId: string) => `user:${userId}:biologicalAge`,
  tokenEarnings: (userId: string) => `user:${userId}:tokenEarnings`,
};

/**
 * Cache TTL constants (in seconds)
 */
export const cacheTTL = {
  short: 60, // 1 minute
  medium: 300, // 5 minutes
  long: 3600, // 1 hour
  veryLong: 86400, // 24 hours
};
