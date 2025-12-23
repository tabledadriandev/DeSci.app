import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';
import { cameraAnalysisService } from '@/lib/camera-analysis';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * POST /api/camera-analysis/food-recognition
 * Recognize foods in image and analyze nutrition including polyphenols, resistant starch, etc.
 */
export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('sessionToken')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await authService.verifySession(sessionToken);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const { imageBase64, mealType, chefId, chefName } = await request.json();

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      );
    }

    // Recognize foods and analyze nutrition
    const recognitionResult = await cameraAnalysisService.recognizeFood(imageBase64);

    // Enrich with USDA FoodData Central data for accurate nutrition
    // TODO: Integrate with USDA API for each identified food

    // Save image
    const imageUrl = `/api/images/food-recognition/${Date.now()}-${user.id}.jpg`;

    // Create camera analysis record
    const analysis = await prisma.cameraAnalysis.create({
      data: {
        userId: user.id,
        type: 'food_recognition',
        imageUrl,
        imageData: imageBase64.substring(0, 1000),
        foodsIdentified: recognitionResult.foods,
        nutritionAnalysis: recognitionResult.nutritionAnalysis,
        recommendations: generateFoodRecommendations(recognitionResult),
      },
    });

    // Create meal log entry
    const mealLog = await prisma.mealLog.create({
      data: {
        userId: user.id,
        mealType: mealType || 'snack',
        imageUrl,
        cameraAnalysisId: analysis.id,
        foodsIdentified: recognitionResult.foods.map((f: any) => f.name),
        portionSizes: recognitionResult.foods.map((f: any) => ({
          food: f.name,
          size: f.portionSize.estimated,
          unit: f.portionSize.unit,
          weight: f.portionSize.estimated,
        })),
        calories: recognitionResult.nutritionAnalysis.calories,
        protein: recognitionResult.nutritionAnalysis.protein,
        carbs: recognitionResult.nutritionAnalysis.carbs,
        fats: recognitionResult.nutritionAnalysis.fats,
        fiber: recognitionResult.nutritionAnalysis.fiber,
        polyphenols: recognitionResult.nutritionAnalysis.polyphenols,
        resistantStarch: recognitionResult.nutritionAnalysis.resistantStarch,
        glycemicLoad: recognitionResult.nutritionAnalysis.glycemicLoad,
        glycemicIndex: recognitionResult.nutritionAnalysis.glycemicIndex,
        allergens: recognitionResult.nutritionAnalysis.allergens,
        vitamins: recognitionResult.nutritionAnalysis.vitamins,
        minerals: recognitionResult.nutritionAnalysis.minerals,
        chefId: chefId || null,
        chefName: chefName || null,
        chefVerified: chefId ? true : false,
      },
    });

    return NextResponse.json({
      success: true,
      analysis: {
        id: analysis.id,
        foodsIdentified: analysis.foodsIdentified,
        nutritionAnalysis: analysis.nutritionAnalysis,
        recommendations: analysis.recommendations,
      },
      mealLog: {
        id: mealLog.id,
        mealType: mealLog.mealType,
        calories: mealLog.calories,
        protein: mealLog.protein,
        carbs: mealLog.carbs,
        fats: mealLog.fats,
        polyphenols: mealLog.polyphenols,
        resistantStarch: mealLog.resistantStarch,
        allergens: mealLog.allergens,
      },
    });
  } catch (error: any) {
    console.error('Error recognizing food:', error);
    return NextResponse.json(
      { error: error.message || 'Food recognition failed' },
      { status: 500 }
    );
  }
}

/**
 * Generate recommendations based on food recognition
 */
function generateFoodRecommendations(result: any): string[] {
  const recommendations: string[] = [];

  const totalPolyphenols = result.nutritionAnalysis?.polyphenols?.total || 0;
  if (totalPolyphenols < 500) {
    recommendations.push('Aim for 1,500mg+ of polyphenols daily. Add berries, dark chocolate, and green tea to your diet');
  }

  if (result.nutritionAnalysis?.glycemicLoad && result.nutritionAnalysis.glycemicLoad > 20) {
    recommendations.push('High glycemic load detected. Consider adding fiber or protein to balance blood sugar response');
  }

  if (result.nutritionAnalysis?.allergens && result.nutritionAnalysis.allergens.length > 0) {
    recommendations.push(`Allergens detected: ${result.nutritionAnalysis.allergens.join(', ')}. Please be cautious if you have allergies.`);
  }

  if (result.nutritionAnalysis?.resistantStarch?.total && result.nutritionAnalysis.resistantStarch.total > 5) {
    recommendations.push('Good source of resistant starch detected. This supports gut health and butyrate production');
  }

  return recommendations;
}

