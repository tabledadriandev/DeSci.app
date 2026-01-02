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
      biomarkerReadings: { take: 10, orderBy: { date: 'desc' } },
    },
  });

  return {
    biomarkers: user?.biomarkerReadings || [],
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
  } catch (error) {
    console.error('Disease prevention module error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Request failed';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}