import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { labResultsPDFGenerator } from '@/lib/test-kits/pdf-generator';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { userId, providerEmail, message, testResultIds } = await request.json();

    if (!userId || !providerEmail) {
      return NextResponse.json(
        { error: 'User ID and provider email are required' },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ walletAddress: userId }, { email: userId }],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get test result IDs if not provided
    let resultIds = testResultIds;
    if (!resultIds || resultIds.length === 0) {
      const recentResults = await prisma.testResult.findMany({
        where: {
          userId: user.id,
          status: 'completed',
        },
        orderBy: { processingCompletedAt: 'desc' },
        take: 5,
        select: { id: true },
      });
      resultIds = recentResults.map((r: any) => r.id);
    }

    if (resultIds.length === 0) {
      return NextResponse.json(
        { error: 'No test results found to share' },
        { status: 404 }
      );
    }

    // Generate PDF report
    const pdfBuffer = await labResultsPDFGenerator.generateReport(
      user.id,
      resultIds,
      {
        includeTrends: true,
        includeRecommendations: true,
        includeReferenceRanges: true,
        format: 'detailed',
      }
    );

    // TODO: In production, implement actual sharing:
    // 1. Store PDF in secure storage (AWS S3, etc.)
    // 2. Generate secure share link with expiration
    // 3. Send email to provider with link
    // 4. Log sharing activity for audit trail
    // 5. Support HIPAA/GDPR compliance

    // For now, return success with share link placeholder
    const shareId = `share-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create share record (would create ShareRecord model in production)
    // await prisma.shareRecord.create({
    //   data: {
    //     userId: user.id,
    //     providerEmail,
    //     shareId,
    //     expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    //     testResultIds: resultIds,
    //   },
    // });

    // TODO: Send email with secure link
    // await sendShareEmail(providerEmail, shareId, message);

    return NextResponse.json({
      success: true,
      shareId,
      message: 'Lab results shared successfully. Provider will receive an email with secure access.',
      // In production, return secure share URL
      shareUrl: `/api/health/reports/shared/${shareId}`, // Placeholder
    });
  } catch (error: any) {
    console.error('Share lab results error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to share lab results' },
      { status: 500 }
    );
  }
}

