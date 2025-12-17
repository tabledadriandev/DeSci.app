import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';
import { cameraAnalysisService } from '@/lib/camera-analysis';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * POST /api/camera-analysis/facial
 * Analyze facial features including skin health, stress levels, age estimation, and vital signs
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

    const { imageBase64, actualAge } = await request.json();

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      );
    }

    // Analyze facial features
    const analysisResult = await cameraAnalysisService.analyzeFacial(imageBase64);

    // Save image to storage (in production, use S3 or similar)
    const imageUrl = `/api/images/camera-analysis/${Date.now()}-${user.id}.jpg`;

    // Create camera analysis record
    const analysis = await prisma.cameraAnalysis.create({
      data: {
        userId: user.id,
        type: 'facial',
        imageUrl,
        imageData: imageBase64.substring(0, 1000), // Store reference only
        skinHealth: analysisResult.skinHealth,
        eyeAnalysis: analysisResult.eyeAnalysis,
        facialSymmetry: analysisResult.facialSymmetry,
        stressLevel: analysisResult.stressLevel,
        estimatedAge: analysisResult.estimatedAge,
        actualAge: actualAge || null,
        heartRateEstimate: analysisResult.heartRateEstimate,
        respiratoryRate: analysisResult.respiratoryRate,
        bloodOxygenEstimate: analysisResult.bloodOxygenEstimate,
        recommendations: generateFacialRecommendations(analysisResult),
      },
    });

    return NextResponse.json({
      success: true,
      analysis: {
        id: analysis.id,
        skinHealth: analysis.skinHealth,
        eyeAnalysis: analysis.eyeAnalysis,
        facialSymmetry: analysis.facialSymmetry,
        stressLevel: analysis.stressLevel,
        estimatedAge: analysis.estimatedAge,
        actualAge: analysis.actualAge,
        heartRateEstimate: analysis.heartRateEstimate,
        respiratoryRate: analysis.respiratoryRate,
        bloodOxygenEstimate: analysis.bloodOxygenEstimate,
        recommendations: analysis.recommendations,
        analyzedAt: analysis.analyzedAt,
      },
    });
  } catch (error: any) {
    console.error('Error analyzing facial features:', error);
    return NextResponse.json(
      { error: error.message || 'Facial analysis failed' },
      { status: 500 }
    );
  }
}

/**
 * Generate recommendations based on facial analysis
 */
function generateFacialRecommendations(result: any): string[] {
  const recommendations: string[] = [];

  if (result.skinHealth?.hydration < 40) {
    recommendations.push('Increase water intake to improve skin hydration');
  }

  if (result.skinHealth?.uvDamage > 50) {
    recommendations.push('Use SPF 30+ sunscreen daily to protect against UV damage');
  }

  if (result.stressLevel && result.stressLevel > 7) {
    recommendations.push('Consider stress management techniques like meditation or breathwork');
  }

  if (result.estimatedAge && result.actualAge && result.estimatedAge > result.actualAge + 5) {
    recommendations.push('Your biological age appears higher than chronological age. Focus on sleep, nutrition, and exercise to reduce biological age');
  }

  if (result.eyeAnalysis?.darkCircles) {
    recommendations.push('Ensure adequate sleep (7-9 hours) to reduce dark circles');
  }

  if (result.eyeAnalysis?.fatigue > 70) {
    recommendations.push('Get more rest and consider eye exercises to reduce eye fatigue');
  }

  return recommendations;
}

