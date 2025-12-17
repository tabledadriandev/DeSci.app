/**
 * Chef Earnings and Rewards Calculation
 * Handles both crypto ($TA tokens) and fiat (USD) earnings
 */

import { prisma } from '@/lib/prisma';

export interface EarningsSummary {
  totalEarnings: {
    crypto: number; // $TA tokens
    fiat: number; // USD
  };
  byType: {
    meal_logged: number;
    biomarker_bonus: number;
    referral: number;
    booking_commission: number;
    subscription: number;
  };
  period: {
    week: number;
    month: number;
    quarter: number;
    year: number;
  };
}

export class ChefEarningsCalculator {
  /**
   * Calculate total earnings for a chef
   */
  async calculateTotalEarnings(chefId: string): Promise<EarningsSummary> {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    // Get all earnings
    const allEarnings = await prisma.chefEarning.findMany({
      where: { chefId },
    });

    // Calculate totals by currency
    const cryptoEarnings = allEarnings.filter((e: typeof allEarnings[number]) => e.currency === 'TA');
    const fiatEarnings = allEarnings.filter((e: typeof allEarnings[number]) => e.currency === 'USD');

    const totalCrypto = cryptoEarnings.reduce(
      (sum: number, e: typeof allEarnings[number]) => sum + e.amount,
      0
    );
    const totalFiat = fiatEarnings.reduce(
      (sum: number, e: typeof allEarnings[number]) => sum + e.amount,
      0
    );

    // Calculate by type
    const byType = {
      meal_logged: allEarnings
        .filter((e: typeof allEarnings[number]) => e.type === 'meal_logged')
        .reduce((sum: number, e: typeof allEarnings[number]) => sum + e.amount, 0),
      biomarker_bonus: allEarnings
        .filter((e: typeof allEarnings[number]) => e.type === 'biomarker_bonus')
        .reduce((sum: number, e: typeof allEarnings[number]) => sum + e.amount, 0),
      referral: allEarnings
        .filter((e: typeof allEarnings[number]) => e.type === 'referral')
        .reduce((sum: number, e: typeof allEarnings[number]) => sum + e.amount, 0),
      booking_commission: allEarnings
        .filter((e: typeof allEarnings[number]) => e.type === 'booking_commission')
        .reduce((sum: number, e: typeof allEarnings[number]) => sum + e.amount, 0),
      subscription: allEarnings
        .filter((e: typeof allEarnings[number]) => e.type === 'subscription')
        .reduce((sum: number, e: typeof allEarnings[number]) => sum + e.amount, 0),
    };

    // Calculate by period
    const period = {
      week: allEarnings
        .filter((e: typeof allEarnings[number]) => new Date(e.createdAt) >= weekAgo)
        .reduce((sum: number, e: typeof allEarnings[number]) => sum + e.amount, 0),
      month: allEarnings
        .filter((e: typeof allEarnings[number]) => new Date(e.createdAt) >= monthAgo)
        .reduce((sum: number, e: typeof allEarnings[number]) => sum + e.amount, 0),
      quarter: allEarnings
        .filter((e: typeof allEarnings[number]) => new Date(e.createdAt) >= quarterAgo)
        .reduce((sum: number, e: typeof allEarnings[number]) => sum + e.amount, 0),
      year: allEarnings
        .filter((e: typeof allEarnings[number]) => new Date(e.createdAt) >= yearAgo)
        .reduce((sum: number, e: typeof allEarnings[number]) => sum + e.amount, 0),
    };

    return {
      totalEarnings: {
        crypto: totalCrypto,
        fiat: totalFiat,
      },
      byType,
      period,
    };
  }

  /**
   * Calculate biomarker improvement bonus
   * 100-500 $TA bonus for biomarker improvements >20%
   */
  async calculateBiomarkerBonus(
    chefId: string,
    userId: string,
    improvementPercentage: number
  ): Promise<number> {
    if (improvementPercentage < 20) {
      return 0; // No bonus for <20% improvement
    }

    // Bonus tiers:
    // 20-30%: 100 $TA
    // 30-40%: 200 $TA
    // 40-50%: 300 $TA
    // 50-60%: 400 $TA
    // 60%+: 500 $TA

    let bonusAmount = 0;
    if (improvementPercentage >= 60) {
      bonusAmount = 500;
    } else if (improvementPercentage >= 50) {
      bonusAmount = 400;
    } else if (improvementPercentage >= 40) {
      bonusAmount = 300;
    } else if (improvementPercentage >= 30) {
      bonusAmount = 200;
    } else if (improvementPercentage >= 20) {
      bonusAmount = 100;
    }

    // Check if chef accepts crypto
    const chef = await prisma.chefProfile.findUnique({
      where: { id: chefId },
    });

    if (!chef || !chef.acceptsCrypto) {
      return 0; // No bonus if chef doesn't accept crypto
    }

    // Record the bonus
    await prisma.chefEarning.create({
      data: {
        chefId,
        type: 'biomarker_bonus',
        amount: bonusAmount,
        currency: 'TA',
        description: `Biomarker improvement bonus: ${improvementPercentage.toFixed(1)}% improvement`,
        biomarkerImprovement: improvementPercentage,
      },
    });

    // Update chef balance
    await prisma.chefProfile.update({
      where: { id: chefId },
      data: {
        taTokenBalance: {
          increment: bonusAmount,
        },
        taEarningsTotal: {
          increment: bonusAmount,
        },
      },
    });

    return bonusAmount;
  }

  /**
   * Calculate referral bonus
   * 100 $TA per client referral (crypto) or $50 USD (fiat)
   */
  async calculateReferralBonus(
    chefId: string,
    referredUserId: string,
    currency: 'TA' | 'USD' = 'TA'
  ): Promise<number> {
    // Check if referral already processed
    const existing = await prisma.chefEarning.findFirst({
      where: {
        chefId,
        type: 'referral',
        referralUserId: referredUserId,
      },
    });

    if (existing) {
      return 0; // Already processed
    }

    const bonusAmount = currency === 'TA' ? 100 : 50;

    const chef = await prisma.chefProfile.findUnique({
      where: { id: chefId },
    });

    if (!chef) {
      return 0;
    }

    // Check payment method acceptance
    if (currency === 'TA' && !chef.acceptsCrypto) {
      return 0;
    }
    if (currency === 'USD' && !chef.acceptsFiat) {
      return 0;
    }

    // Record the bonus
    await prisma.chefEarning.create({
      data: {
        chefId,
        type: 'referral',
        amount: bonusAmount,
        currency,
        referralUserId: referredUserId,
        description: `Client referral bonus`,
      },
    });

    // Update chef balance
    if (currency === 'TA') {
      await prisma.chefProfile.update({
        where: { id: chefId },
        data: {
          taTokenBalance: {
            increment: bonusAmount,
          },
          taEarningsTotal: {
            increment: bonusAmount,
          },
        },
      });
    } else {
      await prisma.chefProfile.update({
        where: { id: chefId },
        data: {
          fiatEarningsTotal: {
            increment: bonusAmount,
          },
        },
      });
    }

    return bonusAmount;
  }

  /**
   * Calculate booking commission (Fiat Path: 15% platform commission)
   */
  async calculateBookingCommission(
    chefId: string,
    bookingId: string,
    bookingPrice: number
  ): Promise<number> {
    const commissionRate = 0.15; // 15%
    const commissionAmount = bookingPrice * commissionRate;

    // Record commission
    await prisma.chefEarning.create({
      data: {
        chefId,
        type: 'booking_commission',
        amount: commissionAmount,
        currency: 'USD',
        bookingId,
        description: `Booking commission (15% of ${bookingPrice})`,
      },
    });

    // Update chef fiat earnings
    await prisma.chefProfile.update({
      where: { id: chefId },
      data: {
        fiatEarningsTotal: {
          increment: commissionAmount,
        },
      },
    });

    return commissionAmount;
  }
}

export const chefEarningsCalculator = new ChefEarningsCalculator();

