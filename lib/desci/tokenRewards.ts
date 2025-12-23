/**
 * DeSci Token Rewards System
 * Calculates token rewards for various user actions
 */

import { PrismaClient } from '@prisma/client';
import { ContractService } from '@/lib/contract-service';

const prisma = new PrismaClient();

export interface RewardAction {
  type:
    | 'daily_sync'
    | 'food_logging'
    | 'medical_upload'
    | 'protocol_completion'
    | 'research_study'
    | 'achievement'
    | 'referral';
  userId: string;
  metadata?: Record<string, any>;
}

export interface RewardCalculation {
  action: RewardAction;
  dataPoints: number;
  tokenReward: number;
  reason: string;
}

export class TokenRewardsService {
  private contractService: ContractService;

  constructor() {
    this.contractService = new ContractService();
  }

  /**
   * Calculate token reward for an action
   */
  async calculateReward(action: RewardAction): Promise<RewardCalculation> {
    let dataPoints = 0;
    let tokenReward = 0;
    let reason = '';

    switch (action.type) {
      case 'daily_sync':
        // Daily wearable sync: +0.1 $TA
        dataPoints = 10; // Assume 10 data points per sync
        tokenReward = 0.1;
        reason = 'Daily wearable data sync';
        break;

      case 'food_logging':
        // Food logging (3+ meals): +0.5 $TA/day
        const mealCount = action.metadata?.mealCount || 0;
        if (mealCount >= 3) {
          dataPoints = 3;
          tokenReward = 0.5;
          reason = `Logged ${mealCount} meals today`;
        }
        break;

      case 'medical_upload':
        // Medical result upload: +5 $TA
        dataPoints = 50; // Assume 50 biomarkers per test
        tokenReward = 5.0;
        reason = 'Medical results uploaded';
        break;

      case 'protocol_completion':
        // Complete 30-day protocol: +1 $TA
        dataPoints = 30; // One data point per day
        tokenReward = 1.0;
        reason = 'Completed 30-day protocol';
        break;

      case 'research_study':
        // Join research study: +10 $TA
        dataPoints = 100; // Significant contribution
        tokenReward = 10.0;
        reason = `Joined research study: ${action.metadata?.studyName || 'Unknown'}`;
        break;

      case 'achievement':
        // Achievement unlock: +0.5-5 $TA (varies by achievement)
        const achievementType = action.metadata?.achievementType || '';
        const achievementRewards: Record<string, number> = {
          sleep_optimizer: 0.5,
          hrv_master: 1.0,
          protocol_warrior: 1.0,
          food_logger: 0.5,
          early_riser: 0.5,
          night_owl: 0.5,
          meditation_master: 2.0,
          biohacker: 3.0,
          longevity_leader: 5.0,
          data_contributor: 5.0,
        };
        tokenReward = achievementRewards[achievementType] || 0.5;
        dataPoints = Math.floor(tokenReward * 10);
        reason = `Achievement unlocked: ${achievementType}`;
        break;

      case 'referral':
        // Referral: +5 $TA per signup
        dataPoints = 5;
        tokenReward = 5.0;
        reason = `Referred user: ${action.metadata?.referredUserId || 'Unknown'}`;
        break;

      default:
        throw new Error(`Unknown reward action type: ${action.type}`);
    }

    return {
      action,
      dataPoints,
      tokenReward,
      reason,
    };
  }

  /**
   * Distribute token reward to user
   */
  async distributeReward(
    userId: string,
    calculation: RewardCalculation,
    researchStudy?: string
  ): Promise<{ contributionId: string; transactionHash?: string }> {
    // Create DeSci contribution record
    const contribution = await prisma.deSciContribution.create({
      data: {
        userId,
        dataPoints: calculation.dataPoints,
        tokenReward: calculation.tokenReward,
        researchStudy: researchStudy || null,
      },
    });

    // Update user's total tokens earned
    await prisma.user.update({
      where: { id: userId },
      data: {
        totalTokensEarned: {
          increment: calculation.tokenReward,
        },
      },
    });

    // Log on-chain (if user has wallet address)
    let transactionHash: string | undefined;
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { walletAddress: true },
      });

      if (user?.walletAddress) {
        // Note: This would require a contract function to mint/distribute tokens
        // For now, we'll just log the contribution
        // In production, you'd call a contract function like:
        // transactionHash = await this.contractService.distributeReward(
        //   user.walletAddress as `0x${string}`,
        //   calculation.tokenReward
        // );
        
        // Update contribution with transaction hash if available
        if (transactionHash) {
          await prisma.deSciContribution.update({
            where: { id: contribution.id },
            data: { transactionHash },
          });
        }
      }
    } catch (error) {
      console.error('Error logging reward on-chain:', error);
      // Continue even if on-chain logging fails
    }

    return {
      contributionId: contribution.id,
      transactionHash,
    };
  }

  /**
   * Get user's total token earnings
   */
  async getUserTokenEarnings(userId: string): Promise<{
    totalEarned: number;
    totalDataPoints: number;
    contributions: Array<{
      id: string;
      date: Date;
      dataPoints: number;
      tokenReward: number;
      researchStudy: string | null;
      transactionHash: string | null;
    }>;
  }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { totalTokensEarned: true },
    });

    const contributions = await prisma.deSciContribution.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 100, // Last 100 contributions
    });

    const totalDataPoints = contributions.reduce(
      (sum, c) => sum + c.dataPoints,
      0
    );

    return {
      totalEarned: user?.totalTokensEarned || 0,
      totalDataPoints,
      contributions: contributions.map((c) => ({
        id: c.id,
        date: c.date,
        dataPoints: c.dataPoints,
        tokenReward: c.tokenReward,
        researchStudy: c.researchStudy,
        transactionHash: c.transactionHash,
      })),
    };
  }

  /**
   * Get user's token earnings breakdown by action type
   */
  async getUserEarningsBreakdown(userId: string): Promise<
    Record<string, { count: number; tokens: number; dataPoints: number }>
  > {
    const contributions = await prisma.deSciContribution.findMany({
      where: { userId },
    });

    const breakdown: Record<
      string,
      { count: number; tokens: number; dataPoints: number }
    > = {};

    // Note: We'd need to store action type in DeSciContribution model
    // For now, infer from researchStudy field or use metadata
    contributions.forEach((c) => {
      const category = c.researchStudy || 'other';
      if (!breakdown[category]) {
        breakdown[category] = { count: 0, tokens: 0, dataPoints: 0 };
      }
      breakdown[category].count += 1;
      breakdown[category].tokens += c.tokenReward;
      breakdown[category].dataPoints += c.dataPoints;
    });

    return breakdown;
  }

  /**
   * Process reward for multiple actions (batch)
   */
  async processBatchRewards(
    userId: string,
    actions: RewardAction[]
  ): Promise<Array<{ action: RewardAction; contributionId: string }>> {
    const results = [];

    for (const action of actions) {
      try {
        const calculation = await this.calculateReward(action);
        const { contributionId } = await this.distributeReward(
          userId,
          calculation,
          action.metadata?.researchStudy
        );
        results.push({ action, contributionId });
      } catch (error) {
        console.error(`Error processing reward for action ${action.type}:`, error);
      }
    }

    return results;
  }
}

export const createTokenRewardsService = () => new TokenRewardsService();
