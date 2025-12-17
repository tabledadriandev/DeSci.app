import { NextRequest, NextResponse } from 'next/server';
import { gutBrainAxisTracker } from '@/lib/microbiome/gut-brain-axis';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const timeframe = (searchParams.get('timeframe') || 'month') as 'week' | 'month' | 'quarter';

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    // Analyze correlations
    const correlations = await gutBrainAxisTracker.analyzeCorrelations(userId, timeframe);

    // Get latest microbiome result for precursor analysis
    const latestMicrobiome = await prisma.microbiomeResult.findFirst({
      where: { userId },
      orderBy: { testDate: 'desc' },
    });

    let serotoninAnalysis = null;
    let dopamineAnalysis = null;

    if (latestMicrobiome) {
      serotoninAnalysis = gutBrainAxisTracker.analyzeSerotoninPrecursors(latestMicrobiome);
      dopamineAnalysis = gutBrainAxisTracker.analyzeDopaminePrecursors(latestMicrobiome);
    }

    return NextResponse.json({
      success: true,
      correlations,
      serotoninAnalysis,
      dopamineAnalysis,
      timeframe,
    });
  } catch (error: any) {
    console.error('Gut-brain axis correlation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze gut-brain axis correlations' },
      { status: 500 }
    );
  }
}

