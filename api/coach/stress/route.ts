import { NextRequest, NextResponse } from 'next/server';
import { StressMentalWellnessModule } from '@/lib/ai-coach/modules';
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
      biomarkers: { take: 5, orderBy: { recordedAt: 'desc' } },
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
    const stressModule = new StressMentalWellnessModule();

    let response;

    switch (action) {
      case 'cbt_techniques':
        if (!data?.situation) {
          return NextResponse.json({ error: 'Situation description required' }, { status: 400 });
        }
        response = await stressModule.provideCBTTechniques(data.situation, userContext);
        break;

      case 'breathwork_protocol':
        const goal = data?.goal || 'stress_reduction';
        if (!['stress_reduction', 'energy_boost', 'sleep', 'focus'].includes(goal)) {
          return NextResponse.json({ error: 'Invalid goal' }, { status: 400 });
        }
        response = await stressModule.designBreathworkProtocol(goal as any, userContext);
        break;

      case 'interpret_stress_biomarkers':
        if (!data?.biomarkers) {
          return NextResponse.json({ error: 'Biomarkers required' }, { status: 400 });
        }
        response = await stressModule.interpretStressBiomarkers(data.biomarkers, userContext);
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Stress module error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process stress/mental wellness request' },
      { status: 500 }
    );
  }
}

