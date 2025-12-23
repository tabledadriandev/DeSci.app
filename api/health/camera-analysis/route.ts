import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type, imageData, ...analysisData } = body;

    // Find user
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { walletAddress: userId },
          { email: userId },
        ],
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          walletAddress: userId.startsWith('0x') ? userId : `0x${Buffer.from(userId).toString('hex').slice(0, 40).padStart(40, '0')}`,
          email: userId.includes('@') ? userId : null,
        },
      });
    }

    // Save image (in production, upload to cloud storage)
    const imageUrl = `/api/images/${Date.now()}.jpg`; // Placeholder

    // Create camera analysis
    const analysis = await prisma.cameraAnalysis.create({
      data: {
        userId: user.id,
        type,
        imageUrl,
        imageData: imageData?.substring(0, 1000), // Store first 1000 chars as reference
        skinHealth: analysisData.skinHealth,
        eyeAnalysis: analysisData.eyeAnalysis,
        facialSymmetry: analysisData.facialSymmetry,
        stressLevel: analysisData.stressLevel,
        estimatedAge: analysisData.estimatedAge,
        measurements: analysisData.measurements,
        bodyFatEstimate: analysisData.bodyFatEstimate,
        muscleSymmetry: analysisData.muscleSymmetry,
        postureAnalysis: analysisData.postureAnalysis,
        heartRate: analysisData.heartRate,
        breathingRate: analysisData.breathingRate,
        stressIndicators: analysisData.stressIndicators,
      },
    });

    return NextResponse.json({ success: true, analysis });
  } catch (error: any) {
    console.error('Error saving camera analysis:', error);
    return NextResponse.json(
      { error: 'Failed to save analysis', details: error.message },
      { status: 500 }
    );
  }
}

