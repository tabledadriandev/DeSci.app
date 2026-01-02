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
    let licensePurchases: unknown[] = [];

    if (licenseId) {
      // Calculate for specific license (DataLicensePurchase model not in schema)
      // const license = await prisma.dataLicensePurchase.findUnique({
      //   where: { id: licenseId },
      // });
      // if (!license || license.paymentStatus !== 'paid') {
      //   return NextResponse.json(
      //     { error: 'License not found or not paid' },
      //     { status: 400 }
      //   );
      // }
      // totalRevenue = license.userRevenueShare; // 40% already calculated
      // licensePurchases = [license];
      return NextResponse.json(
        { error: 'DataLicensePurchase model not implemented' },
        { status: 501 }
      );
    } else {
      // Calculate for all paid licenses in period (DataLicensePurchase model not in schema)
      // const now = new Date();
      // let startDate: Date | undefined;
      //
      // if (period === 'quarterly') {
      //   const quarter = Math.floor(now.getMonth() / 3);
      //   startDate = new Date(now.getFullYear(), quarter * 3, 1);
      // } else if (period === 'monthly') {
      //   startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      // }
      //
      // const where: unknown = { paymentStatus: 'paid' };
      // if (startDate) {
      //   where.paidAt = { gte: startDate };
      // }
      //
      // licensePurchases = await prisma.dataLicensePurchase.findMany({
      //   where,
      // });
      //
      // totalRevenue = licensePurchases.reduce(
      //   (sum, l) => sum + l.userRevenueShare,
      //   0
      // );
      totalRevenue = 0;
      licensePurchases = [];
    }

    // Get all opted-in users
    const optedInUsers = await prisma.dataLicenseOptIn.findMany({
      where: { optedIn: true },
      include: {
        user: {
          select: {
            id: true,
            walletAddress: true,
            totalTokensEarned: true,
            stakedTokens: true,
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
    interface OptInUserWithDetails {
      user: {
        id: string;
        walletAddress: string | null;
        totalTokensEarned: number | null;
        stakedTokens: number | null;
      };
    }
    const totalTokenWeight = optedInUsers.reduce(
      (sum: number, opt: OptInUserWithDetails) => sum + (opt.user.totalTokensEarned || 0),
      0
    );
    const totalStakedWeight = optedInUsers.reduce(
      (sum: number, opt: OptInUserWithDetails) => sum + (opt.user.stakedTokens || 0),
      0
    );

    const dividends = optedInUsers.map((opt: OptInUserWithDetails) => {
      const tokenWeight = opt.user.totalTokensEarned || 0;
      const stakedWeight = opt.user.stakedTokens || 0;

      // Weighted share
      const tokenShare = totalTokenWeight > 0 ? tokenWeight / totalTokenWeight : 0;
      const stakedShare = totalStakedWeight > 0 ? stakedWeight / totalStakedWeight : 0;
      const combinedShare = tokenShare * 0.6 + stakedShare * 0.4;

      const dividendAmount = totalRevenue * combinedShare;

      return {
        userId: opt.user.id,
        walletAddress: opt.user.walletAddress,
        tokenBalance: opt.user.totalTokensEarned || 0,
        stakedAmount: opt.user.stakedTokens || 0,
        share: combinedShare,
        dividendAmount,
        currency: 'TA', // Token holders get $tabledadrian
      };
    });

    // Filter out zero dividends
    const nonZeroDividends = dividends.filter((d: { dividendAmount: number }) => d.dividendAmount > 0.01);

    return NextResponse.json({
      totalRevenue,
      totalUsers: optedInUsers.length,
      eligibleUsers: nonZeroDividends.length,
      licenseCount: licensePurchases.length,
      dividends: nonZeroDividends.sort((a: { dividendAmount: number }, b: { dividendAmount: number }) => b.dividendAmount - a.dividendAmount),
      calculatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error calculating dividends:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to calculate dividends';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

