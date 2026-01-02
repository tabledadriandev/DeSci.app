import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { microbiomeAnalyzer } from '@/lib/microbiome/analysis';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const resultId = searchParams.get('resultId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    // TODO: MicrobiomeResult model not yet implemented
    return NextResponse.json(
      { error: 'Microbiome analysis not yet implemented' },
      { status: 501 }
    );
  } catch (error: unknown) {
    console.error('Microbiome analysis error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to analyze microbiome';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

function calculateTrends(results: unknown[]): {
  shannonIndexTrend: string;
  diversityTrend: string;
  inflammationTrend: string;
} {
  if (results.length < 2) {
    return {
      shannonIndexTrend: 'insufficient_data',
      diversityTrend: 'insufficient_data',
      inflammationTrend: 'insufficient_data',
    };
  }

  const first = results[0] as { shannonIndex?: number; inflammationRisk?: number };
  const latest = results[results.length - 1] as { shannonIndex?: number; inflammationRisk?: number };

  const shannonChange = ((latest.shannonIndex || 0) - (first.shannonIndex || 0)) / (first.shannonIndex || 1);
  const inflammationChange = ((latest.inflammationRisk || 0) - (first.inflammationRisk || 0));

  return {
    shannonIndexTrend: shannonChange > 0.1 ? 'improving' : shannonChange < -0.1 ? 'declining' : 'stable',
    diversityTrend: shannonChange > 0.1 ? 'increasing' : shannonChange < -0.1 ? 'decreasing' : 'stable',
    inflammationTrend: inflammationChange < -1 ? 'decreasing' : inflammationChange > 1 ? 'increasing' : 'stable',
  };
}

interface MicrobiomeResult {
  shannonIndex?: number;
  akkermansiaMuciniphila?: number;
  [key: string]: unknown;
}

interface MicrobiomeTrends {
  shannonIndexTrend?: string;
  diversityTrend?: string;
  inflammationTrend?: string;
  [key: string]: unknown;
}

function generateInsights(result: MicrobiomeResult, trends: MicrobiomeTrends): string[] {
  const insights: string[] = [];

  // Diversity insights
  if (result.shannonIndex) {
    if (result.shannonIndex > 4.0) {
      insights.push(`Excellent microbiome diversity (Shannon Index: ${result.shannonIndex.toFixed(2)}). Keep up the varied diet!`);
    } else if (result.shannonIndex < 3.0) {
      insights.push(`Low microbiome diversity (Shannon Index: ${result.shannonIndex.toFixed(2)}). Focus on increasing dietary variety.`);
    }
  }

  // Beneficial bacteria insights
  if (result.akkermansiaMuciniphila && result.akkermansiaMuciniphila > 0.01) {
    insights.push('Good levels of Akkermansia muciniphila detected - supports gut barrier function.');
  } else {
    insights.push('Consider adding polyphenol-rich foods (berries, pomegranate) to support Akkermansia muciniphila.');
  }

  const bifidobacterium = result.bifidobacterium as number | undefined;
  if (bifidobacterium !== undefined && bifidobacterium < 0.01) {
    insights.push('Low Bifidobacterium detected. Consider prebiotics (onions, garlic, bananas) or probiotics.');
  }

  // Inflammation insights
  const inflammationRisk = result.inflammationRisk as number | undefined;
  if (inflammationRisk !== undefined) {
    if (inflammationRisk > 7) {
      insights.push('High inflammation risk detected. Focus on anti-inflammatory foods and reducing processed foods.');
    } else if (inflammationRisk < 3) {
      insights.push('Low inflammation risk - excellent gut health marker!');
    }
  }

  // Pathogen insights
  if (result.pathogens && Array.isArray(result.pathogens)) {
    const highRiskPathogens = result.pathogens.filter((p: unknown) => {
      const pathogen = p as { presence?: boolean; level?: string; name?: string };
      return pathogen.presence && pathogen.level === 'high';
    });
    if (highRiskPathogens.length > 0) {
      insights.push(`High-risk pathogens detected: ${highRiskPathogens.map((p: unknown) => {
        const pathogen = p as { name?: string };
        return pathogen.name || 'Unknown';
      }).join(', ')}. Consider consulting a healthcare provider.`);
    }
  }

  // Trend insights
  if (trends.diversityTrend === 'increasing') {
    insights.push('Microbiome diversity is improving! Continue current dietary patterns.');
  } else if (trends.diversityTrend === 'decreasing') {
    insights.push('Microbiome diversity is declining. Review recent dietary changes and increase variety.');
  }

  return insights;
}

