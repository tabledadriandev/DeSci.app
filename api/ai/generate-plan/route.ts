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
    type UserWithPreferences = {
      biologicalAge?: number | null;
      preferences?: { 
        goals?: string[];
        dietary?: string[];
        exercise?: string[];
        timeCommitment?: number;
      } | null;
      createdAt: Date;
    };
    const userAny = user as unknown as UserWithPreferences;
    const userData = {
      age: userAny.biologicalAge ? Math.round((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365.25)) : 40,
      gender: 'unknown', // Would come from user profile
      biologicalAge: userAny.biologicalAge || undefined,
      goals: userAny.preferences?.goals || ['longevity', 'performance'],
      preferences: {
        dietary: userAny.preferences?.dietary || [],
        exercise: userAny.preferences?.exercise || [],
        timeCommitment: userAny.preferences?.timeCommitment || 30,
      },
    };

    const wearableData = {
      hrv: latestHRV?.value || 50,
      sleepScore: latestSleep?.value || 75,
      recovery: latestRecovery?.value || 70,
      activity: latestActivity?.value || 30,
    };

    type MedicalResult = {
      biomarkers?: Array<{
        name?: string;
        value?: number;
        flag?: string;
      }>;
    };
    const medicalData = medicalResults.map((result: unknown) => {
      const medicalResult = result as MedicalResult;
      return {
        biomarkers: (medicalResult.biomarkers || [])
          .filter((b) => b.name && b.value !== undefined)
          .map((b) => ({
            name: b.name!,
            value: b.value!,
            status: (b.flag === 'normal' ? 'optimal' : b.flag === 'high' || b.flag === 'low' ? 'suboptimal' : 'concerning') as 'optimal' | 'good' | 'suboptimal' | 'concerning',
        })),
      };
    });

    type FoodLog = {
      calories?: number;
      protein?: number;
      carbs?: number;
      fat?: number;
      micronutrients?: Record<string, unknown>;
    };
    const foodData = foodLogs.map((log: unknown) => {
      const foodLog = log as FoodLog;
      return {
        calories: foodLog.calories || 0,
        protein: foodLog.protein || 0,
        carbs: foodLog.carbs || 0,
        fat: foodLog.fat || 0,
        micronutrients: foodLog.micronutrients as Record<string, unknown> | undefined,
      };
    });

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
        recommendations: JSON.parse(JSON.stringify(plan)),
        mealPlan: JSON.parse(JSON.stringify(plan.nutrition?.mealPlan || {})),
        exercisePlan: JSON.parse(JSON.stringify(plan.exercise || {})),
        supplementStack: JSON.parse(JSON.stringify(plan.supplements || {})),
        expectedResults: JSON.parse(JSON.stringify(plan.expectedResults || {})),
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
  } catch (error) {
    console.error('Plan generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Plan generation failed';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
