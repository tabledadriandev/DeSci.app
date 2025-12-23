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

    // Get user's latest microbiome result for personalized predictions
    const latestMicrobiome = await prisma.microbiomeResult.findFirst({
      where: { userId },
      orderBy: { testDate: 'desc' },
    });

    const userMicrobiome = latestMicrobiome ? {
      shannonIndex: latestMicrobiome.shannonIndex || undefined,
      scfaProducers: latestMicrobiome.scfaProducers as Array<{ species: string; abundance: number; scfaType: string }> || undefined,
    } : undefined;

    // Predict fermentation
    const prediction = await fermentationPredictor.predictFermentation(
      mealComposition as MealComposition,
      userMicrobiome
    );

    return NextResponse.json({
      success: true,
      prediction,
    });
  } catch (error: any) {
    console.error('Fermentation prediction error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to predict fermentation' },
      { status: 500 }
    );
  }
}

