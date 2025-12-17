import { NextRequest, NextResponse } from 'next/server';
import { FitnessMovementModule } from '@/lib/ai-coach/modules';
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
    const fitnessModule = new FitnessMovementModule();

    let response;

    switch (action) {
      case 'generate_workout':
        const goals = data?.goals || ['General fitness'];
        const daysPerWeek = data?.daysPerWeek || 4;
        response = await fitnessModule.generateWorkoutPlan(goals, userContext, daysPerWeek);
        break;

      case 'analyze_form':
        if (!data?.exerciseName || !data?.videoOrDescription) {
          return NextResponse.json(
            { error: 'Exercise name and form description required' },
            { status: 400 }
          );
        }
        response = await fitnessModule.analyzeForm(
          data.exerciseName,
          data.videoOrDescription,
          userContext
        );
        break;

      case 'recovery_protocol':
        if (!data?.workoutType) {
          return NextResponse.json({ error: 'Workout type required' }, { status: 400 });
        }
        response = await fitnessModule.createRecoveryProtocol(data.workoutType, userContext);
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Fitness module error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process fitness request' },
      { status: 500 }
    );
  }
}

