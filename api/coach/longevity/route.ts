import { NextRequest, NextResponse } from 'next/server';
import { LongevityAntiAgingModule } from '@/lib/ai-coach/modules';
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
    const longevityModule = new LongevityAntiAgingModule();

    let response;

    switch (action) {
      case 'reduce_biological_age':
        const currentAge = data?.currentAge || 40; // Age can be passed in data or default to 40
        const biologicalAge = data?.biologicalAge || currentAge;
        response = await longevityModule.reduceBiologicalAge(
          currentAge,
          biologicalAge,
          userContext
        );
        break;

      case 'optimize_telomeres':
        response = await longevityModule.optimizeTelomereHealth(userContext);
        break;

      case 'boost_nad':
        response = await longevityModule.boostNADplus(userContext);
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Longevity module error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Request failed';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}