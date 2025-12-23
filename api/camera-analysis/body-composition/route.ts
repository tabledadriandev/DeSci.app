import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';
import { cameraAnalysisService } from '@/lib/camera-analysis';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * POST /api/camera-analysis/body-composition
 * Analyze body composition from front, side, and back images
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

    const { frontImage, sideImage, backImage } = await request.json();

    if (!frontImage || !sideImage) {
      return NextResponse.json(
        { error: 'Front and side images are required' },
        { status: 400 }
      );
    }

    // Analyze body composition
    const analysisResult = await cameraAnalysisService.analyzeBodyComposition({
      front: frontImage,
      side: sideImage,
      back: backImage,
    });

    // Save images to storage
    const frontImageUrl = `/api/images/body-composition/${Date.now()}-${user.id}-front.jpg`;
    const sideImageUrl = `/api/images/body-composition/${Date.now()}-${user.id}-side.jpg`;
    const backImageUrl = backImage ? `/api/images/body-composition/${Date.now()}-${user.id}-back.jpg` : null;

    // Find previous analysis for comparison
    const previousAnalysis = await prisma.cameraAnalysis.findFirst({
      where: {
        userId: user.id,
        type: 'body_composition',
      },
      orderBy: {
        analyzedAt: 'desc',
      },
    });

    // Create camera analysis record
    const analysis = await prisma.cameraAnalysis.create({
      data: {
        userId: user.id,
        type: 'body_composition',
        imageUrl: frontImageUrl, // Primary image
        imageData: JSON.stringify({ front: frontImageUrl, side: sideImageUrl, back: backImageUrl }),
        measurements: analysisResult.measurements,
        bodyFatEstimate: analysisResult.bodyFatEstimate,
        leanMuscleMass: analysisResult.leanMuscleMass,
        muscleSymmetry: analysisResult.muscleSymmetry,
        postureAnalysis: analysisResult.postureAnalysis,
        bodyModel3D: analysisResult.postureAnalysis, // Store 3D model data if available
        comparisonId: previousAnalysis?.id || null,
        progress: previousAnalysis ? calculateProgress(previousAnalysis, analysisResult) : null,
        recommendations: generateBodyCompositionRecommendations(analysisResult),
      },
    });

    return NextResponse.json({
      success: true,
      analysis: {
        id: analysis.id,
        measurements: analysis.measurements,
        bodyFatEstimate: analysis.bodyFatEstimate,
        leanMuscleMass: analysis.leanMuscleMass,
        muscleSymmetry: analysis.muscleSymmetry,
        postureAnalysis: analysis.postureAnalysis,
        progress: analysis.progress,
        recommendations: analysis.recommendations,
        analyzedAt: analysis.analyzedAt,
      },
    });
  } catch (error: any) {
    console.error('Error analyzing body composition:', error);
    return NextResponse.json(
      { error: error.message || 'Body composition analysis failed' },
      { status: 500 }
    );
  }
}

/**
 * Calculate progress compared to previous analysis
 */
function calculateProgress(previous: any, current: any): any {
  return {
    bodyFatChange: previous.bodyFatEstimate && current.bodyFatEstimate
      ? current.bodyFatEstimate - previous.bodyFatEstimate
      : null,
    muscleMassChange: previous.leanMuscleMass && current.leanMuscleMass
      ? current.leanMuscleMass - previous.leanMuscleMass
      : null,
    postureImprovement: previous.postureAnalysis?.spinalAlignment !== current.postureAnalysis?.spinalAlignment
      ? 'improved'
      : 'maintained',
  };
}

/**
 * Generate recommendations based on body composition analysis
 */
function generateBodyCompositionRecommendations(result: any): string[] {
  const recommendations: string[] = [];

  if (result.bodyFatEstimate > 25) {
    recommendations.push('Consider a body fat reduction program focusing on cardio and strength training');
  }

  if (result.muscleSymmetry?.difference > 10) {
    recommendations.push('Muscle asymmetry detected. Focus on unilateral exercises to balance muscle development');
  }

  if (result.postureAnalysis?.spinalAlignment !== 'aligned') {
    recommendations.push('Posture correction exercises recommended. Consider physical therapy or chiropractic consultation');
  }

  if (result.measurements?.waist && result.measurements?.hip) {
    const waistToHipRatio = result.measurements.waist / result.measurements.hip;
    if (waistToHipRatio > 0.9) {
      recommendations.push('High waist-to-hip ratio detected. Focus on core strengthening and cardiovascular health');
    }
  }

  return recommendations;
}

