import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { walletAddress: userId },
          { email: userId },
        ],
      },
      include: {
        profile: true,
        healthAssessments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        healthScores: {
          orderBy: { date: 'desc' },
          take: 1,
        },
        biomarkers: {
          orderBy: { recordedAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!user) {
      return NextResponse.json(null);
    }

    return NextResponse.json({
      healthScore: user.healthScores[0]?.overallScore,
      riskScores: user.healthAssessments[0] ? {
        heartDisease: user.healthAssessments[0].heartDiseaseRisk,
        diabetes: user.healthAssessments[0].diabetesRisk,
        hypertension: user.healthAssessments[0].hypertensionRisk,
      } : null,
      recentBiomarkers: user.biomarkers,
      profile: user.profile,
    });
  } catch (error: any) {
    console.error('Error fetching health context:', error);
    return NextResponse.json(
      { error: 'Failed to fetch health context' },
      { status: 500 }
    );
  }
}

