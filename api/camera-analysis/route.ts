import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/camera-analysis
 * Get user's camera analysis history
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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: { userId: string; type?: string } = { userId: user.id };
    if (type) {
      where.type = type;
    }

    const analyses = await prisma.cameraAnalysis.findMany({
      where,
      orderBy: { analyzedAt: 'desc' },
      take: limit,
      select: {
        id: true,
        type: true,
        imageUrl: true,
        analyzedAt: true,
        // Include type-specific fields
        skinHealth: true,
        eyeAnalysis: true,
        stressLevel: true,
        estimatedAge: true,
        bodyFatEstimate: true,
        heartRateEstimate: true,
        respiratoryRate: true,
        eyeHealthRisks: true,
      },
    });

    return NextResponse.json({
      success: true,
      analyses,
    });
  } catch (error) {
    console.error('Error fetching camera analyses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch camera analyses' },
      { status: 500 }
    );
  }
}

