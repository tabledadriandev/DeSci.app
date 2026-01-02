/**
 * Retroactive Public Goods Funding (RPGF) System
 * Rewards users who contribute verified health data to research
 */

import { prisma } from '@/lib/prisma';

export interface DataDonorScore {
  userId: string;
  dataCompleteness: number; // 0-100
  privacyScore: number; // 0-100 (higher = more zk-proofs used)
  researchImpact: number; // 0-100 (based on citations/studies)
  totalScore: number;
}

/**
 * Calculate data donor score for RPGF allocation
 */
export async function calculateDataDonorScore(
  userId: string,
  quarter: string // e.g., "2025-Q1"
): Promise<DataDonorScore> {
  // Get all proofs for this quarter
  const quarterStart = new Date(quarter.split('-')[0]);
  const quarterEnd = new Date(quarterStart);
  quarterEnd.setMonth(quarterEnd.getMonth() + 3);

  const proofs = await prisma.proofOfHealth.findMany({
    where: {
      userId,
      createdAt: {
        gte: quarterStart,
        lt: quarterEnd,
      },
    },
  });

  // Calculate data completeness (frequency × metric diversity)
  const uniqueMetrics = new Set(
    proofs
      .map((p: unknown) => {
        const proof = p as { metadata?: { metric?: string; logs?: Array<{ metric?: string }> } };
        if (proof.metadata?.metric) return proof.metadata.metric;
        if (proof.metadata?.logs) {
          return proof.metadata.logs.map((l: { metric?: string }) => l.metric).filter(Boolean);
        }
        return null;
      })
      .flat()
      .filter(Boolean) as string[]
  );
  const dataCompleteness = Math.min(
    (proofs.length / 90) * 100 + uniqueMetrics.size * 10,
    100
  );

  // Calculate privacy score (higher for zk-proofs, lower for raw hashes)
  const zkProofs = proofs.filter((p: unknown) => (p as { proofType?: string }).proofType === 'zk_range').length;
  const privacyScore = Math.min((zkProofs / proofs.length) * 100, 100);

  // Calculate research impact (would be based on actual study citations)
  // For now, use a placeholder based on data completeness
  const researchImpact = dataCompleteness * 0.8; // Placeholder

  // Total score (weighted average)
  const totalScore =
    dataCompleteness * 0.4 + privacyScore * 0.3 + researchImpact * 0.3;

  return {
    userId,
    dataCompleteness,
    privacyScore,
    researchImpact,
    totalScore,
  };
}

/**
 * Allocate RPGF rewards to data donors
 */
export async function allocateRPGF(
  quarter: string,
  totalAllocation: number // Total $tabledadrian tokens to allocate
): Promise<
  Array<{
    userId: string;
    allocation: number;
    score: number;
  }>
> {
  // Get all users with proofs in this quarter
  const quarterStart = new Date(quarter.split('-')[0]);
  const quarterEnd = new Date(quarterStart);
  quarterEnd.setMonth(quarterEnd.getMonth() + 3);

  const users = await prisma.proofOfHealth.findMany({
    where: {
      createdAt: {
        gte: quarterStart,
        lt: quarterEnd,
      },
    },
    select: {
      userId: true,
    },
    distinct: ['userId'],
  });

  // Calculate scores for all users
  const scores = await Promise.all(
    users.map((u: unknown) => calculateDataDonorScore((u as { userId: string }).userId, quarter))
  );

  // Sort by total score
  scores.sort((a, b) => b.totalScore - a.totalScore);

  // Quadratic funding allocation
  const allocations = scores.map((score: typeof scores[0]) => {
    // Quadratic: allocation = sqrt(score) / sum(sqrt(all scores)) * total
    const sqrtScore = Math.sqrt(score.totalScore);
    return {
      userId: score.userId,
      sqrtScore,
      score: score.totalScore,
    };
  });

  const totalSqrt = allocations.reduce((sum: number, a: typeof allocations[0]) => sum + a.sqrtScore, 0);

  // Allocate proportionally
  const finalAllocations = allocations.map((a: typeof allocations[0]) => ({
    userId: a.userId,
    allocation: (a.sqrtScore / totalSqrt) * totalAllocation,
    score: a.score,
  }));

  return finalAllocations;
}

/**
 * Distribute RPGF rewards
 */
export async function distributeRewards(
  quarter: string,
  allocations: Array<{ userId: string; allocation: number }>
): Promise<{ success: boolean; distributed: number }> {
  let distributed = 0;

  for (const allocation of allocations) {
    try {
      // Update user's total tokens earned
      await prisma.user.update({
        where: { id: allocation.userId },
        data: {
          totalTokensEarned: {
            increment: allocation.allocation,
          },
        },
      });

      // Record RPGF contribution
      await prisma.deSciContribution.create({
        data: {
          userId: allocation.userId,
          dataPoints: 0, // RPGF doesn't count data points
          tokenReward: allocation.allocation,
          researchStudy: `RPGF-${quarter}`,
        },
      });

      distributed += allocation.allocation;
    } catch (error) {
      console.error(`Failed to distribute to ${allocation.userId}:`, error);
    }
  }

  return { success: true, distributed };
}













