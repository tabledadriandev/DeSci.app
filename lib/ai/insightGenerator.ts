/**
 * AI Insight Generator
 * Uses Claude API to generate personalized health insights
 */

import Anthropic from '@anthropic-ai/sdk';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface Insight {
  id: string;
  type: 'sleep' | 'recovery' | 'nutrition' | 'exercise' | 'stress' | 'general';
  headline: string;
  emoji: string;
  explanation: string;
  recommendation: string;
  confidence: number; // 0-100
  learnMoreUrl?: string;
  relatedMetrics?: string[];
  createdAt: Date;
}

export interface UserData {
  userId: string;
  age?: number;
  gender?: string;
  biologicalAge?: number;
  goals?: string[];
  biomarkers?: Array<{ metric: string; value: number; date: Date }>;
  advancedMetrics?: {
    hrvCoherence?: number;
    sleepDebt?: number;
    parasympatheticTone?: number;
    longevityScore?: number;
  };
  recentMeals?: Array<{ calories: number; protein: number; carbs: number; fat: number; date: Date }>;
  activeProtocols?: Array<{ name: string; adherence: number }>;
}

export class InsightGenerator {
  private anthropic: Anthropic;

  constructor(apiKey: string) {
    this.anthropic = new Anthropic({ apiKey });
  }

  /**
   * Generate insights based on user data
   */
  async generateInsights(userId: string): Promise<Insight[]> {
    try {
      // Gather user data
      const userData = await this.gatherUserData(userId);
      
      // Build prompt
      const prompt = this.buildPrompt(userData);

      // Call Claude API
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response format');
      }

      // Parse JSON response
      const insightsData = JSON.parse(content.text);
      
      // Transform to Insight objects
      interface InsightData {
        type?: string;
        headline: string;
        emoji?: string;
        [key: string]: unknown;
      }
      const insights: Insight[] = insightsData.insights.map((insight: InsightData, idx: number) => ({
        id: `insight-${Date.now()}-${idx}`,
        type: insight.type || 'general',
        headline: insight.headline,
        emoji: insight.emoji || '💡',
        explanation: insight.explanation,
        recommendation: insight.recommendation,
        confidence: insight.confidence || 75,
        learnMoreUrl: insight.learnMoreUrl,
        relatedMetrics: insight.relatedMetrics || [],
        createdAt: new Date(),
      }));

      return insights;
    } catch (error) {
      console.error('Insight generation error:', error);
      // Return fallback insights
      return this.getFallbackInsights();
    }
  }

  /**
   * Gather comprehensive user data
   */
  private async gatherUserData(userId: string): Promise<UserData> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        biologicalAge: true,
        preferences: true,
      },
    });

    // Get latest biomarker readings
    const latestReadings = await prisma.biomarkerReading.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 10,
      distinct: ['metric'],
    });

    // Get latest advanced metrics
    const latestAdvancedMetrics = await prisma.advancedMetric.findFirst({
      where: { userId },
      orderBy: { calculatedAt: 'desc' },
    });

    // Get recent meal logs
    const recentMeals = await prisma.mealLog.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 7,
    });

    // Get active protocols
    const activeProtocols = await prisma.protocolExperiment.findMany({
      where: {
        userId,
        status: 'active',
      },
    });

    return {
      userId,
      biologicalAge: user?.biologicalAge || undefined,
      goals: ((user?.preferences as unknown) as { goals?: string[] })?.goals || [],
      biomarkers: latestReadings.map((r) => ({
        metric: r.metric,
        value: r.value,
        date: r.date,
      })),
      advancedMetrics: latestAdvancedMetrics
        ? {
            hrvCoherence: latestAdvancedMetrics.metricType === 'hrv_coherence' ? latestAdvancedMetrics.value : 0,
            sleepDebt: latestAdvancedMetrics.metricType === 'sleep_debt' ? latestAdvancedMetrics.value : 0,
            parasympatheticTone: latestAdvancedMetrics.metricType === 'parasympathetic_tone' ? latestAdvancedMetrics.value : 0,
            longevityScore: latestAdvancedMetrics.metricType === 'longevity_score' ? latestAdvancedMetrics.value : 0,
          }
        : undefined,
      recentMeals: recentMeals.map((m) => ({
        calories: m.calories,
        protein: m.protein,
        carbs: m.carbs,
        fat: m.fat,
        date: m.date,
      })),
      activeProtocols: activeProtocols.map((p) => ({
        name: p.name,
        adherence: p.adherence || 0,
      })),
    };
  }

  /**
   * Build prompt for Claude
   */
  private buildPrompt(userData: {
    biologicalAge?: number;
    goals?: string[];
    biomarkers?: Array<{ metric: string; value: number; date: Date }>;
    advancedMetrics?: {
      hrvCoherence?: number;
      sleepDebt?: number;
      parasympatheticTone?: number;
      longevityScore?: number;
    };
    recentMeals?: Array<{ calories: number; protein: number; carbs: number; fat: number; date: Date }>;
    activeProtocols?: Array<{ name: string; adherence: number }>;
  }): string {
    return `You are a longevity and wellness AI coach. Analyze the following user data and generate 3-5 personalized insights with actionable recommendations.

USER DATA:
- Biological Age: ${userData.biologicalAge || 'Not calculated'}
- Goals: ${userData.goals?.join(', ') || 'Not specified'}

LATEST BIOMARKERS:
${userData.biomarkers?.map((r) => `- ${r.metric}: ${r.value}`).join('\n') || 'No recent data'}

ADVANCED METRICS:
${userData.advancedMetrics ? `
- HRV Coherence: ${userData.advancedMetrics.hrvCoherence}
- Sleep Debt: ${userData.advancedMetrics.sleepDebt} hours
- Parasympathetic Tone: ${userData.advancedMetrics.parasympatheticTone}
- Longevity Score: ${userData.advancedMetrics.longevityScore}
` : 'No advanced metrics available'}

RECENT NUTRITION (Last 7 days):
${userData.recentMeals && userData.recentMeals.length > 0 ? `
- Average Calories: ${userData.recentMeals.reduce((sum: number, m) => {
        return sum + (m.calories || 0);
      }, 0) / userData.recentMeals.length}
- Average Protein: ${userData.recentMeals.reduce((sum: number, m) => {
        return sum + (m.protein || 0);
      }, 0) / userData.recentMeals.length}g
` : 'No meal logs'}

ACTIVE PROTOCOLS:
${userData.activeProtocols?.map((p) => `- ${p.name} (${p.adherence}% adherence)`).join('\n') || 'No active protocols'}

Generate 3-5 insights with:
1. Type: sleep, recovery, nutrition, exercise, stress, or general
2. Headline: Short, actionable headline (max 50 chars)
3. Emoji: Relevant emoji
4. Explanation: Brief explanation of the insight (2-3 sentences)
5. Recommendation: Specific, actionable recommendation (1-2 sentences)
6. Confidence: 0-100 (how confident you are in this insight)
7. Related Metrics: Array of metric names this insight relates to

Return as JSON:
{
  "insights": [
    {
      "type": "sleep",
      "headline": "Sleep Pressure Building",
      "emoji": "😴",
      "explanation": "You have accumulated 4 hours of sleep debt over the past week. This is impacting your recovery and HRV.",
      "recommendation": "Prioritize 8+ hours of sleep tonight. Consider going to bed 30 minutes earlier and avoiding screens 1 hour before bed.",
      "confidence": 92,
      "relatedMetrics": ["sleep_score", "sleep_debt", "recovery"]
    }
  ]
}`;
  }

  /**
   * Get fallback insights if API fails
   */
  private getFallbackInsights(): Insight[] {
    return [
      {
        id: 'fallback-1',
        type: 'general',
        headline: 'Start Tracking Your Data',
        emoji: '📊',
        explanation:
          'Begin syncing your wearables and logging meals to unlock personalized insights.',
        recommendation:
          'Connect at least one wearable device and log 3 meals today to get started.',
        confidence: 100,
        relatedMetrics: [],
        createdAt: new Date(),
      },
    ];
  }

  /**
   * Generate insight for a specific metric
   */
  async generateMetricInsight(
    userId: string,
    metric: string,
    value: number
  ): Promise<Insight | null> {
    const insights = await this.generateInsights(userId);
    return insights.find((i) => i.relatedMetrics?.includes(metric)) || null;
  }
}

export const createInsightGenerator = (apiKey: string) =>
  new InsightGenerator(apiKey);
