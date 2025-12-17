import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/data-licensing/dividends/calculate
 * Calculates dividend distribution for a given license purchase or time period.
 * 40% of revenue goes to opted-in users proportionally.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const licenseId = searchParams.get('licenseId');
    const period = searchParams.get('period'); // 'quarterly', 'monthly', 'all'

    let totalRevenue = 0;
    let licensePurchases: any[] = [];

    if (licenseId) {
      // Calculate for specific license
      const license = await prisma.dataLicensePurchase.findUnique({
        where: { id: licenseId },
      });

      if (!license || license.paymentStatus !== 'paid') {
        return NextResponse.json(
          { error: 'License not found or not paid' },
          { status: 400 }
        );
      }

      totalRevenue = license.userRevenueShare; // 40% already calculated
      licensePurchases = [license];
    } else {
      // Calculate for all paid licenses in period
      const now = new Date();
      let startDate: Date | undefined;

      if (period === 'quarterly') {
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
      } else if (period === 'monthly') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      const where: any = { paymentStatus: 'paid' };
      if (startDate) {
        where.paidAt = { gte: startDate };
      }

      licensePurchases = await prisma.dataLicensePurchase.findMany({
        where,
      });

      totalRevenue = licensePurchases.reduce(
        (sum, l) => sum + l.userRevenueShare,
        0
      );
    }

    // Get all opted-in users
    const optedInUsers = await prisma.dataLicenseOptIn.findMany({
      where: { optedIn: true },
      include: {
        user: {
          select: {
            id: true,
            walletAddress: true,
            tokenBalance: true,
            stakedAmount: true,
          },
        },
      },
    });

    if (optedInUsers.length === 0) {
      return NextResponse.json({
        totalRevenue: 0,
        totalUsers: 0,
        dividends: [],
        message: 'No opted-in users to distribute dividends to',
      });
    }

    // Calculate proportional distribution based on:
    // 1. Token holdings (weighted 60%)
    // 2. Staked amount (weighted 40%)
    const totalTokenWeight = optedInUsers.reduce(
      (sum, opt) => sum + (opt.user.tokenBalance || 0),
      0
    );
    const totalStakedWeight = optedInUsers.reduce(
      (sum, opt) => sum + (opt.user.stakedAmount || 0),
      0
    );

    const dividends = optedInUsers.map((opt) => {
      const tokenWeight = opt.user.tokenBalance || 0;
      const stakedWeight = opt.user.stakedAmount || 0;

      // Weighted share
      const tokenShare = totalTokenWeight > 0 ? tokenWeight / totalTokenWeight : 0;
      const stakedShare = totalStakedWeight > 0 ? stakedWeight / totalStakedWeight : 0;
      const combinedShare = tokenShare * 0.6 + stakedShare * 0.4;

      const dividendAmount = totalRevenue * combinedShare;

      return {
        userId: opt.user.id,
        walletAddress: opt.user.walletAddress,
        tokenBalance: opt.user.tokenBalance,
        stakedAmount: opt.user.stakedAmount,
        share: combinedShare,
        dividendAmount,
        currency: 'TA', // Token holders get $TA
      };
    });

    // Filter out zero dividends
    const nonZeroDividends = dividends.filter((d) => d.dividendAmount > 0.01);

    return NextResponse.json({
      totalRevenue,
      totalUsers: optedInUsers.length,
      eligibleUsers: nonZeroDividends.length,
      licenseCount: licensePurchases.length,
      dividends: nonZeroDividends.sort((a, b) => b.dividendAmount - a.dividendAmount),
      calculatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error calculating dividends:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to calculate dividends' },
      { status: 500 }
    );
  }
}

