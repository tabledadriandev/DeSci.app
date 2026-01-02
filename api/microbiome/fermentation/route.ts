import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fermentationPredictor, MealComposition } from '@/lib/microbiome/fermentation-predictor';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { userId, mealComposition } = await request.json();

    if (!userId || !mealComposition) {
      return NextResponse.json(
        { error: 'User ID and meal composition required' },
        { status: 400 }
      );
    }

    // TODO: MicrobiomeResult model not yet implemented
    const latestMicrobiome = null;

    // TODO: MicrobiomeResult model not yet implemented
    const userMicrobiome = undefined;

    // Predict fermentation
    const prediction = await fermentationPredictor.predictFermentation(
      mealComposition as MealComposition,
      userMicrobiome
    );

    return NextResponse.json({
      success: true,
      prediction,
    });
  } catch (error) {
    console.error('Fermentation prediction error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Request failed';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}