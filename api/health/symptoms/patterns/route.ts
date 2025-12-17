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
    });

    if (!user) {
      return NextResponse.json({ correlations: [] });
    }

    const symptoms = await prisma.symptomLog.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
      take: 30,
    });

    if (symptoms.length < 5) {
      return NextResponse.json({
        correlations: [],
        message: 'Need at least 5 symptom logs to identify patterns',
      });
    }

    // Pattern recognition algorithm
    const correlations = identifyPatterns(symptoms);

    return NextResponse.json({ correlations });
  } catch (error: any) {
    console.error('Error analyzing patterns:', error);
    return NextResponse.json(
      { error: 'Failed to analyze patterns' },
      { status: 500 }
    );
  }
}

function identifyPatterns(symptoms: any[]): any[] {
  const correlations: any[] = [];

  // Analyze sleep vs energy correlation
  const lowEnergyDays = symptoms.filter(s => s.energyLevel < 5);
  const lowSleepDays = symptoms.filter(s => s.sleepHours && s.sleepHours < 7);
  const overlap = lowEnergyDays.filter(s => 
    lowSleepDays.some(ls => 
      new Date(s.date).toDateString() === new Date(ls.date).toDateString()
    )
  );

  if (overlap.length > lowEnergyDays.length * 0.6) {
    correlations.push({
      pattern: 'Sleep-Energy Correlation',
      description: `Low energy on ${overlap.length} out of ${lowEnergyDays.length} low-energy days. Improving sleep may boost energy.`,
      confidence: 'High',
    });
  }

  // Analyze mood vs symptoms
  const anxiousDays = symptoms.filter(s => s.mood === 'anxious');
  const headacheDays = symptoms.filter(s => s.headaches || s.migraine);
  const anxiousHeadacheOverlap = anxiousDays.filter(s =>
    headacheDays.some(h => 
      new Date(s.date).toDateString() === new Date(h.date).toDateString()
    )
  );

  if (anxiousHeadacheOverlap.length > 0) {
    correlations.push({
      pattern: 'Anxiety-Headache Link',
      description: `Headaches occurred on ${anxiousHeadacheOverlap.length} anxious days. Stress management may help.`,
      confidence: 'Medium',
    });
  }

  // Analyze digestive issues vs meals
  const digestiveIssueDays = symptoms.filter(s => s.digestiveIssues && s.digestiveIssues.length > 0);
  if (digestiveIssueDays.length > symptoms.length * 0.3) {
    correlations.push({
      pattern: 'Frequent Digestive Issues',
      description: `Digestive issues on ${digestiveIssueDays.length} days. Consider tracking meals to identify triggers.`,
      confidence: 'Medium',
    });
  }

  // Analyze pain patterns
  const painDays = symptoms.filter(s => s.painLocations && s.painLocations.length > 0);
  const mostCommonPainLocation = getMostCommon(painDays.flatMap(s => s.painLocations || []));
  if (mostCommonPainLocation) {
    correlations.push({
      pattern: 'Recurring Pain Location',
      description: `Most common pain location: ${mostCommonPainLocation}. Consider targeted interventions.`,
      confidence: 'High',
    });
  }

  return correlations;
}

function getMostCommon(arr: string[]): string | null {
  if (arr.length === 0) return null;
  const counts: Record<string, number> = {};
  arr.forEach(item => {
    counts[item] = (counts[item] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
}

