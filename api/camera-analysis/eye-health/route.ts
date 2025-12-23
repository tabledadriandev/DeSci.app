import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';
import { cameraAnalysisService } from '@/lib/camera-analysis';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * POST /api/camera-analysis/eye-health
 * Screen eye health including retinal scan analysis for diabetic retinopathy and AMD
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

    const { retinalImageBase64, visualAcuityScore } = await request.json();

    if (!retinalImageBase64) {
      return NextResponse.json(
        { error: 'Retinal image is required' },
        { status: 400 }
      );
    }

    // Analyze eye health
    const analysisResult = await cameraAnalysisService.analyzeEyeHealth(retinalImageBase64);

    // Save retinal image
    const retinalImageUrl = `/api/images/eye-health/${Date.now()}-${user.id}.jpg`;

    // Determine if referral is needed
    const needsReferral = 
      (analysisResult.eyeHealthRisks.diabeticRetinopathy || 0) > 50 ||
      (analysisResult.eyeHealthRisks.amd || 0) > 50 ||
      (analysisResult.eyeHealthRisks.glaucoma || 0) > 50;

    // Create camera analysis record
    const analysis = await prisma.cameraAnalysis.create({
      data: {
        userId: user.id,
        type: 'eye_health',
        imageUrl: retinalImageUrl,
        imageData: retinalImageBase64.substring(0, 1000),
        eyeAnalysis: {
          retinalScanUrl: retinalImageUrl,
          diabeticRetinopathyRisk: analysisResult.eyeHealthRisks.diabeticRetinopathy,
          amdRisk: analysisResult.eyeHealthRisks.amd,
          glaucomaRisk: analysisResult.eyeHealthRisks.glaucoma,
        },
        visualAcuityScore: visualAcuityScore || null,
        retinalImageUrl: retinalImageUrl,
        eyeHealthRisks: analysisResult.eyeHealthRisks,
        recommendations: generateEyeHealthRecommendations(analysisResult, needsReferral),
      },
    });

    return NextResponse.json({
      success: true,
      analysis: {
        id: analysis.id,
        eyeHealthRisks: analysis.eyeHealthRisks,
        visualAcuityScore: analysis.visualAcuityScore,
        retinalImageUrl: analysis.retinalImageUrl,
        recommendations: analysis.recommendations,
        needsReferral,
        analyzedAt: analysis.analyzedAt,
      },
    });
  } catch (error: any) {
    console.error('Error analyzing eye health:', error);
    return NextResponse.json(
      { error: error.message || 'Eye health analysis failed' },
      { status: 500 }
    );
  }
}

/**
 * Generate recommendations based on eye health analysis
 */
function generateEyeHealthRecommendations(result: any, needsReferral: boolean): string[] {
  const recommendations: string[] = [];

  if (needsReferral) {
    recommendations.push('Risk factors detected. Please consult an ophthalmologist for a comprehensive eye exam.');
  }

  if (result.eyeHealthRisks?.diabeticRetinopathy > 30) {
    recommendations.push('Elevated risk for diabetic retinopathy. Ensure blood sugar is well-controlled and schedule regular eye exams.');
  }

  if (result.eyeHealthRisks?.amd > 30) {
    recommendations.push('Elevated risk for age-related macular degeneration. Consider AREDS2 supplements (lutein, zeaxanthin).');
  }

  if (result.eyeHealthRisks?.glaucoma > 30) {
    recommendations.push('Elevated risk for glaucoma. Schedule regular eye pressure checks with an ophthalmologist.');
  }

  recommendations.push('Protect your eyes from UV damage with sunglasses that block 100% of UVA and UVB rays.');
  recommendations.push('Follow the 20-20-20 rule: Every 20 minutes, look at something 20 feet away for 20 seconds.');

  return recommendations;
}

