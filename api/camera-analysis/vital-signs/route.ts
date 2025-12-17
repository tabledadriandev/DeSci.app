import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';
import { cameraAnalysisService } from '@/lib/camera-analysis';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * POST /api/camera-analysis/vital-signs
 * Monitor vital signs using camera (heart rate via PPG, respiratory rate, SpO2)
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

    const { videoFrames, imageBase64, measurementType } = await request.json();

    if (!videoFrames && !imageBase64) {
      return NextResponse.json(
        { error: 'Video frames or image is required' },
        { status: 400 }
      );
    }

    // Analyze vital signs
    // For PPG heart rate, we need video frames (not implemented fully yet)
    // For now, use image analysis for basic estimates
    let analysisResult;
    
    if (videoFrames && videoFrames.length > 0) {
      // Use video frames for more accurate PPG analysis
      analysisResult = await cameraAnalysisService.analyzeVitalSigns(videoFrames);
    } else {
      // Fallback: Basic estimation from static image
      // In production, would use facial analysis to estimate vital signs
      analysisResult = {
        heartRate: null,
        breathingRate: null,
        stressIndicators: {},
      };
    }

    // If imageBase64 provided, use facial analysis to estimate vital signs
    if (imageBase64) {
      const facialAnalysis = await cameraAnalysisService.analyzeFacial(imageBase64);
      if (facialAnalysis.heartRateEstimate) {
        analysisResult.heartRate = facialAnalysis.heartRateEstimate;
      }
      if (facialAnalysis.respiratoryRate) {
        analysisResult.breathingRate = facialAnalysis.respiratoryRate;
      }
      if (facialAnalysis.bloodOxygenEstimate) {
        (analysisResult as any).bloodOxygen = facialAnalysis.bloodOxygenEstimate;
      }
    }

    // Save image/video reference
    const imageUrl = imageBase64 
      ? `/api/images/vital-signs/${Date.now()}-${user.id}.jpg`
      : `/api/videos/vital-signs/${Date.now()}-${user.id}.mp4`;

    // Create camera analysis record
    const analysis = await prisma.cameraAnalysis.create({
      data: {
        userId: user.id,
        type: 'vital_signs',
        imageUrl,
        imageData: imageBase64 ? imageBase64.substring(0, 1000) : null,
        heartRate: analysisResult.heartRate,
        breathingRate: analysisResult.breathingRate,
        bloodOxygenEstimate: analysisResult.bloodOxygen,
        temperature: analysisResult.temperature,
        stressIndicators: analysisResult.stressIndicators,
        recommendations: generateVitalSignsRecommendations(analysisResult),
      },
    });

    // Also create biomarker entry if values are available
    if (analysisResult.heartRate || analysisResult.breathingRate) {
      await prisma.biomarker.create({
        data: {
          // Link to user via relation
          user: {
            connect: { id: user.id },
          },
          heartRate: analysisResult.heartRate || null,
          breathingRate: analysisResult.breathingRate || null,
          source: 'camera',
          // Required JSON field, store empty/custom metadata for now
          customValues: [],
        },
      });
    }

    return NextResponse.json({
      success: true,
      analysis: {
        id: analysis.id,
        heartRate: analysis.heartRate,
        breathingRate: analysis.breathingRate,
        bloodOxygen: analysis.bloodOxygenEstimate,
        temperature: analysis.temperature,
        stressIndicators: analysis.stressIndicators,
        recommendations: analysis.recommendations,
        analyzedAt: analysis.analyzedAt,
      },
    });
  } catch (error: any) {
    console.error('Error analyzing vital signs:', error);
    return NextResponse.json(
      { error: error.message || 'Vital signs analysis failed' },
      { status: 500 }
    );
  }
}

/**
 * Generate recommendations based on vital signs
 */
function generateVitalSignsRecommendations(result: any): string[] {
  const recommendations: string[] = [];

  if (result.heartRate) {
    if (result.heartRate < 60) {
      recommendations.push('Resting heart rate is below normal. Consult a healthcare provider if this is persistent.');
    } else if (result.heartRate > 100) {
      recommendations.push('Elevated heart rate detected. Consider stress reduction techniques and regular exercise.');
    }
  }

  if (result.breathingRate) {
    if (result.breathingRate < 12) {
      recommendations.push('Breathing rate is below normal. Consult a healthcare provider.');
    } else if (result.breathingRate > 20) {
      recommendations.push('Elevated breathing rate. Practice deep breathing exercises.');
    }
  }

  if (result.bloodOxygen && result.bloodOxygen < 95) {
    recommendations.push('Blood oxygen level below normal. Consult a healthcare provider immediately.');
  }

  if (result.stressIndicators?.hrv && result.stressIndicators.hrv < 30) {
    recommendations.push('Low HRV detected. Focus on recovery, sleep, and stress management.');
  }

  return recommendations;
}

