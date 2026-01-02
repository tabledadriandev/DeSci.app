import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';
import { cameraAnalysisService } from '@/lib/camera-analysis';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

/**
 * POST /api/camera-analysis/moles
 * Track and analyze skin lesions/moles using ABCDE criteria
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

    const { 
      moleImageBase64, 
      bodyLocation, 
      locationCoordinates, 
      moleId, 
      name 
    } = await request.json();

    if (!moleImageBase64 || !bodyLocation) {
      return NextResponse.json(
        { error: 'Mole image and body location are required' },
        { status: 400 }
      );
    }

    // Get previous image if moleId is provided (for evolution tracking)
    let previousImageBase64: string | undefined;
    if (moleId) {
      const existingMole = await prisma.moleTracking.findUnique({
        where: { moleId },
      });
      if (existingMole) {
        // Get previous primary image URL and fetch base64 if needed
        previousImageBase64 = existingMole.primaryImageUrl || undefined; // Would fetch actual image in production
      }
    }

    // Analyze mole using ABCDE criteria
    const analysisResult = await cameraAnalysisService.analyzeMole(
      moleImageBase64,
      previousImageBase64
    );

    // Generate unique mole ID if not provided
    const finalMoleId = moleId || `mole-${crypto.randomBytes(16).toString('hex')}`;

    // Save mole image
    const imageUrl = `/api/images/moles/${Date.now()}-${user.id}-${finalMoleId}.jpg`;

    // Check if mole already exists
    const existingMole = await prisma.moleTracking.findUnique({
      where: { moleId: finalMoleId },
    });

    let mole;
    if (existingMole) {
      // Update existing mole with new image and analysis
      const existingImages = Array.isArray(existingMole.comparisonImages) ? existingMole.comparisonImages : [];
      const updatedComparisonImages = [...existingImages, imageUrl];

      mole = await prisma.moleTracking.update({
        where: { moleId: finalMoleId },
        data: {
          primaryImageUrl: imageUrl,
          comparisonImages: JSON.parse(JSON.stringify(updatedComparisonImages)),
          asymmetry: JSON.parse(JSON.stringify(analysisResult.asymmetry)),
          border: JSON.parse(JSON.stringify(analysisResult.border)),
          color: JSON.parse(JSON.stringify(analysisResult.color)),
          diameter: analysisResult.diameter,
          evolution: {
            hasChanged: analysisResult.evolution.hasChanged,
            changes: analysisResult.evolution.changes,
            timeSinceLastCheck: analysisResult.evolution.timeSinceLastCheck,
          },
          melanomaRisk: analysisResult.melanomaRisk,
          riskLevel: JSON.parse(JSON.stringify(analysisResult.riskLevel)),
          // Store full AI analysis as JSON
          aiAnalysis: JSON.parse(JSON.stringify(analysisResult)),
          lastChecked: new Date(),
          checkFrequency: String(calculateCheckFrequency(analysisResult.melanomaRisk || 0)),
          referredToDermatologist: analysisResult.melanomaRisk > 70 ? true : existingMole.referredToDermatologist,
        },
      });
    } else {
      // Create new mole tracking record
      mole = await prisma.moleTracking.create({
        data: {
          userId: user.id,
          moleId: finalMoleId,
          name: name || `Mole ${bodyLocation}`,
          bodyLocation,
          locationCoordinates: locationCoordinates || null,
          primaryImageUrl: imageUrl,
          comparisonImages: [],
          asymmetry: JSON.parse(JSON.stringify(analysisResult.asymmetry)),
          border: JSON.parse(JSON.stringify(analysisResult.border)),
          color: Array.isArray(analysisResult.color) ? analysisResult.color.join(', ') : JSON.parse(JSON.stringify(analysisResult.color)),
          diameter: analysisResult.diameter,
          evolution: {
            hasChanged: false,
            changes: [],
          },
          melanomaRisk: analysisResult.melanomaRisk,
          riskLevel: JSON.parse(JSON.stringify(analysisResult.riskLevel)),
          // Store full AI analysis as JSON
          aiAnalysis: JSON.parse(JSON.stringify(analysisResult)),
          checkFrequency: String(calculateCheckFrequency(analysisResult.melanomaRisk || 0)),
          referredToDermatologist: analysisResult.melanomaRisk > 70,
          referralDate: analysisResult.melanomaRisk > 70 ? new Date() : null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      mole: {
        id: mole.id,
        moleId: mole.moleId,
        name: mole.name,
        bodyLocation: mole.bodyLocation,
        asymmetry: mole.asymmetry,
        border: mole.border,
        color: mole.color,
        diameter: mole.diameter,
        evolution: mole.evolution,
        melanomaRisk: mole.melanomaRisk,
        riskLevel: mole.riskLevel,
        referredToDermatologist: mole.referredToDermatologist,
        checkFrequency: mole.checkFrequency,
        lastChecked: mole.lastChecked,
        recommendations: generateMoleRecommendations(analysisResult),
      },
    });
  } catch (error) {
    console.error('Error analyzing mole:', error);
    const errorMessage = error instanceof Error ? error.message : 'Mole analysis failed';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * Calculate recommended check frequency based on risk
 */
function calculateCheckFrequency(riskScore: number): number {
  if (riskScore > 70) return 30; // Monthly for high risk
  if (riskScore > 40) return 90; // Quarterly for medium risk
  return 180; // Semi-annually for low risk
}

/**
 * Generate recommendations based on mole analysis
 */
function generateMoleRecommendations(result: unknown): string[] {
  const recommendations: string[] = [];
  const moleResult = result as { melanomaRisk?: number; asymmetry?: string; border?: string; color?: string | string[]; diameter?: number; evolution?: { hasChanged?: boolean } };

  if ((moleResult.melanomaRisk || 0) > 70) {
    recommendations.push('HIGH RISK: Consult a dermatologist immediately for professional evaluation.');
  } else if ((moleResult.melanomaRisk || 0) > 40) {
    recommendations.push('Elevated risk detected. Schedule a dermatologist appointment within 1-2 weeks.');
  } else {
    recommendations.push('Continue regular self-monitoring. Use ABCDE criteria to check for changes.');
  }

  if (moleResult.asymmetry === 'asymmetric') {
    recommendations.push('Asymmetric shape detected. Monitor for changes.');
  }

  if (moleResult.border === 'irregular' || moleResult.border === 'jagged') {
    recommendations.push('Irregular border detected. This is a potential warning sign.');
  }

  const colors = Array.isArray(moleResult.color) ? moleResult.color : (moleResult.color ? [moleResult.color] : []);
  if (colors.some(c => c.includes('multi')) || colors.length > 2) {
    recommendations.push('Multiple colors detected. Monitor for color changes.');
  }

  if (moleResult.diameter && moleResult.diameter > 6) {
    recommendations.push('Diameter exceeds 6mm. Larger moles should be monitored more closely.');
  }

  if (moleResult.evolution?.hasChanged) {
    recommendations.push('Changes detected since last check. Consult a dermatologist.');
  }

  recommendations.push('Use sunscreen (SPF 30+) to protect moles from UV damage.');
  recommendations.push(`Check this mole every ${calculateCheckFrequency(moleResult.melanomaRisk || 0)} days.`);

  return recommendations;
}

/**
 * GET /api/camera-analysis/moles
 * Get all moles for a user
 */
export async function GET(request: NextRequest) {
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

    const moles = await prisma.moleTracking.findMany({
      where: { userId: user.id },
      orderBy: { lastChecked: 'desc' },
    });

    return NextResponse.json({
      success: true,
      moles: moles.map((mole) => ({
        id: mole.id,
        moleId: mole.moleId,
        name: mole.name,
        bodyLocation: mole.bodyLocation,
        primaryImageUrl: mole.primaryImageUrl,
        melanomaRisk: mole.melanomaRisk,
        riskLevel: mole.riskLevel,
        lastChecked: mole.lastChecked,
        checkFrequency: mole.checkFrequency,
        referredToDermatologist: mole.referredToDermatologist,
      })),
    });
  } catch (error) {
    console.error('Error fetching moles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch moles' },
      { status: 500 }
    );
  }
}


