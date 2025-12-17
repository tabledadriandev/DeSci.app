import { NextRequest, NextResponse } from 'next/server';
import { DiseasePreventionModule } from '@/lib/ai-coach/modules';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getUserContext(userId: string) {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ walletAddress: userId }, { email: userId }],
    },
    include: {
      profile: true,
      healthData: { take: 10, orderBy: { recordedAt: 'desc' } },
      biomarkers: { take: 10, orderBy: { recordedAt: 'desc' } },
    },
  });

  return {
    profile: user?.profile,
    healthData: user?.healthData || [],
    biomarkers: user?.biomarkers || [],
  };
}

export async function POST(request: NextRequest) {
  try {
    const { userId, action, data } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const userContext = await getUserContext(userId);
    const preventionModule = new DiseasePreventionModule();

    let response;

    switch (action) {
      case 'optimize_cardiovascular':
        const riskFactors = data?.riskFactors || {};
        response = await preventionModule.optimizeCardiovascularHealth(riskFactors, userContext);
        break;

      case 'prevent_diabetes':
        const biomarkers = data?.biomarkers || userContext.biomarkers || [];
        const diabetesRiskFactors = data?.riskFactors || {};
        response = await preventionModule.preventDiabetes(diabetesRiskFactors, biomarkers, userContext);
        break;

      case 'reduce_cancer_risk':
        const cancerRiskFactors = data?.riskFactors || {};
        response = await preventionModule.reduceCancerRisk(cancerRiskFactors, userContext);
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Disease prevention module error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process disease prevention request' },
      { status: 500 }
    );
  }
}

