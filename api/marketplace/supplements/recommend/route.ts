import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const goal = (searchParams.get('goal') || '').toLowerCase(); // e.g. longevity, sleep, metabolic

    // Base query: active marketplace items tagged as supplements
    const baseWhere: any = {
      isActive: true,
      OR: [
        { category: 'supplement' },
        { type: 'product' },
      ],
    };

    const supplements = await prisma.marketplaceItem.findMany({
      where: baseWhere,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // Placeholder personalization: just tag a simple score based on goal keywords.
    const scored = supplements.map((item) => {
      const text = `${item.name} ${item.description}`.toLowerCase();
      let score = 1;

      if (goal) {
        if (goal.includes('sleep') && /sleep|melatonin|magnesium/.test(text)) score += 3;
        if ((goal.includes('longevity') || goal.includes('anti')) && /resveratrol|omega|polyphenol/.test(text))
          score += 3;
        if ((goal.includes('metab') || goal.includes('weight')) && /metabolic|glucose|insulin/.test(text))
          score += 3;
        if (goal.includes('gut') && /probiotic|fiber|prebiotic/.test(text)) score += 3;
      }

      return { ...item, score };
    });

    scored.sort((a, b) => b.score - a.score);

    return NextResponse.json(scored);
  } catch (error: any) {
    console.error('Error recommending supplements:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to recommend supplements' },
      { status: 500 },
    );
  }
}


