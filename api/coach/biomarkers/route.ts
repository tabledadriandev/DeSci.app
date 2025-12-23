import { NextRequest, NextResponse } from 'next/server';
import { BiomarkerInterpretationModule } from '@/lib/ai-coach/modules';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getUserContext(userId: string) {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ walletAddress: userId }, { email: userId }],
    },
    include: {
      profile: true,
      biomarkers: { take: 20, orderBy: { recordedAt: 'desc' } },
    },
  });

  return {
    profile: user?.profile,
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
    const biomarkerModule = new BiomarkerInterpretationModule();

    let response;

    switch (action) {
      case 'interpret_labs':
        const labResults = data?.labResults || userContext.biomarkers || [];
        if (labResults.length === 0) {
          return NextResponse.json({ error: 'Lab results required' }, { status: 400 });
        }
        response = await biomarkerModule.interpretLabResults(labResults, userContext);
        break;

      case 'explain_marker':
        if (!data?.markerName || data?.value === undefined) {
          return NextResponse.json(
            { error: 'Marker name and value required' },
            { status: 400 }
          );
        }
        response = await biomarkerModule.explainMarker(
          data.markerName,
          data.value,
          data.unit || '',
          userContext
        );
        break;

      case 'track_trends':
        if (!data?.markerName || !data?.historicalValues) {
          return NextResponse.json(
            { error: 'Marker name and historical values required' },
            { status: 400 }
          );
        }
        response = await biomarkerModule.trackTrends(
          data.markerName,
          data.historicalValues,
          userContext
        );
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Biomarker module error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process biomarker request' },
      { status: 500 }
    );
  }
}

