import { NextRequest, NextResponse } from 'next/server';
import { SleepOptimizationModule } from '@/lib/ai-coach/modules';
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
    },
  });

  return {
    profile: user?.profile,
    healthData: user?.healthData || [],
  };
}

export async function POST(request: NextRequest) {
  try {
    const { userId, action, data } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const userContext = await getUserContext(userId);
    const sleepModule = new SleepOptimizationModule();

    let response;

    switch (action) {
      case 'bedtime_routine':
        response = await sleepModule.designBedtimeRoutine(userContext);
        break;

      case 'optimize_environment':
        const currentConditions = data?.currentConditions || {};
        response = await sleepModule.optimizeSleepEnvironment(currentConditions, userContext);
        break;

      case 'recommend_supplements':
        response = await sleepModule.recommendSleepSupplements(userContext);
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Sleep module error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process sleep request' },
      { status: 500 }
    );
  }
}

