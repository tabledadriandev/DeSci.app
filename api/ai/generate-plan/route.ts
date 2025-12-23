/**
 * AI Longevity Plan Generation API
 * Generates personalized protocol from all data sources
 */

import { NextRequest, NextResponse } from 'next/server';
import { createLongevityPlanGenerator } from '@/lib/ai/longevityPlanGenerator';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds for AI generation

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    // Check Anthropic API key
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      );
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get wearable data (latest readings)
    const latestHRV = await prisma.biomarkerReading.findFirst({
      where: { userId, metric: 'hrv' },
      orderBy: { date: 'desc' },
    });

    const latestSleep = await prisma.biomarkerReading.findFirst({
      where: { userId, metric: 'sleep_score' },
      orderBy: { date: 'desc' },
    });

    const latestRecovery = await prisma.biomarkerReading.findFirst({
      where: { userId, metric: 'recovery' },
      orderBy: { date: 'desc' },
    });

    const latestActivity = await prisma.biomarkerReading.findFirst({
      where: { userId, metric: 'active_minutes' },
      orderBy: { date: 'desc' },
    });

    // Get medical results
    const medicalResults = await prisma.medicalResult.findMany({
      where: { userId },
      orderBy: { testDate: 'desc' },
      take: 1,
    });

    // Get food logs (last 7 days)
    const foodLogs = await prisma.mealLog.findMany({
      where: {
        userId,
        date: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      orderBy: { date: 'desc' },
    });

    // Prepare data for AI
    const userData = {
      age: user.biologicalAge ? Math.round((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365.25)) : 40,
      gender: 'unknown', // Would come from user profile
      biologicalAge: user.biologicalAge || undefined,
      goals: (user.preferences as any)?.goals || ['longevity', 'performance'],
      preferences: user.preferences || {},
    };

    const wearableData = {
      hrv: latestHRV?.value || 50,
      sleepScore: latestSleep?.value || 75,
      recovery: latestRecovery?.value || 70,
      activity: latestActivity?.value || 30,
    };

    const medicalData = medicalResults.map(result => ({
      biomarkers: (result.biomarkers as any[]).map((b: any) => ({
        name: b.name,
        value: b.value,
        status: b.flag === 'normal' ? 'optimal' : b.flag === 'high' || b.flag === 'low' ? 'suboptimal' : 'concerning',
      })),
    }));

    const foodData = foodLogs.map(log => ({
      calories: log.calories,
      protein: log.protein,
      carbs: log.carbs,
      fat: log.fat,
      micronutrients: log.micronutrients,
    }));

    // Generate plan
    const generator = createLongevityPlanGenerator(anthropicKey);
    const plan = await generator.generatePlan(
      userData,
      wearableData,
      medicalData,
      foodData
    );

    // Store in database
    const longevityPlan = await prisma.longevityPlan.create({
      data: {
        userId,
        planType: 'combined',
        recommendations: plan as any,
        mealPlan: plan.nutrition.mealPlan as any,
        exercisePlan: plan.exercise as any,
        supplementStack: plan.supplements as any,
        expectedResults: plan.expectedResults as any,
        startDate: new Date(),
        status: 'active',
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        planId: longevityPlan.id,
        plan,
      },
    });
  } catch (error: any) {
    console.error('Plan generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate longevity plan' },
      { status: 500 }
    );
  }
}
