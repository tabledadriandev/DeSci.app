/**
 * API Route: Generate AI insights
 */

import { NextRequest, NextResponse } from 'next/server';
import { createInsightGenerator } from '@/lib/ai/insightGenerator';
import { getUserIdFromBody, getUserIdFromHeader } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = getUserIdFromBody(body) || getUserIdFromHeader(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      );
    }

    const generator = createInsightGenerator(apiKey);
    const insights = await generator.generateInsights(userId);

    return NextResponse.json({
      success: true,
      insights,
    });
  } catch (error: any) {
    console.error('Insight generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate insights' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromHeader(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const metric = searchParams.get('metric');
    const value = searchParams.get('value');

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      );
    }

    const generator = createInsightGenerator(apiKey);

    if (metric && value) {
      const insight = await generator.generateMetricInsight(
        userId,
        metric,
        parseFloat(value)
      );
      return NextResponse.json({
        success: true,
        insight,
      });
    } else {
      const insights = await generator.generateInsights(userId);
      return NextResponse.json({
        success: true,
        insights,
      });
    }
  } catch (error: any) {
    console.error('Insight generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate insights' },
      { status: 500 }
    );
  }
}
