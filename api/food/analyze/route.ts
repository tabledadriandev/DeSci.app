/**
 * Nutritional Analysis API
 * Analyzes identified foods and provides detailed nutrition breakdown
 */

import { NextRequest, NextResponse } from 'next/server';
import { createFoodVisionClient } from '@/lib/ai/foodVision';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { userId, foods, mealType, date } = await request.json();

    if (!userId || !foods || !Array.isArray(foods)) {
      return NextResponse.json(
        { error: 'Missing userId or foods array' },
        { status: 400 }
      );
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const foodClient = createFoodVisionClient(openaiKey);

    // Calculate nutrition
    const nutrition = await foodClient.calculateNutrition(foods);
    
    // Analyze micronutrients
    const micronutrients = await foodClient.analyzeMicronutrients(foods);

    // Get user's daily targets (would be stored in user preferences)
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    const dailyTargets = {
      calories: 2000, // Default, would come from user preferences
      protein: 150,
      carbs: 200,
      fat: 65,
    };

    // Compare to targets
    const comparison = {
      calories: {
        current: nutrition.calories,
        target: dailyTargets.calories,
        remaining: dailyTargets.calories - nutrition.calories,
        percentage: (nutrition.calories / dailyTargets.calories) * 100,
      },
      protein: {
        current: nutrition.protein,
        target: dailyTargets.protein,
        remaining: dailyTargets.protein - nutrition.protein,
        percentage: (nutrition.protein / dailyTargets.protein) * 100,
      },
      carbs: {
        current: nutrition.carbs,
        target: dailyTargets.carbs,
        remaining: dailyTargets.carbs - nutrition.carbs,
        percentage: (nutrition.carbs / dailyTargets.carbs) * 100,
      },
      fat: {
        current: nutrition.fat,
        target: dailyTargets.fat,
        remaining: dailyTargets.fat - nutrition.fat,
        percentage: (nutrition.fat / dailyTargets.fat) * 100,
      },
    };

    // Generate suggestions
    const suggestions = await foodClient.generateSuggestions(nutrition, micronutrients);

    return NextResponse.json({
      success: true,
      data: {
        nutrition,
        micronutrients,
        comparison,
        suggestions,
      },
    });
  } catch (error: any) {
    console.error('Food analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze food' },
      { status: 500 }
    );
  }
}
