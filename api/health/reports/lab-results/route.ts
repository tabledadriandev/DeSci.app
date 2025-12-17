import { NextRequest, NextResponse } from 'next/server';
import { labResultsPDFGenerator } from '@/lib/test-kits/pdf-generator';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const testResultIds = searchParams.get('testResultIds')?.split(',') || [];
    const includeTrends = searchParams.get('includeTrends') === 'true';
    const includeRecommendations = searchParams.get('includeRecommendations') !== 'false';
    const includeReferenceRanges = searchParams.get('includeReferenceRanges') !== 'false';

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
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

    // If no test result IDs provided, get all recent test results
    let resultIds = testResultIds;
    if (resultIds.length === 0) {
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
        { error: 'No test results found to generate report' },
        { status: 404 }
      );
    }

    // Generate PDF
    const pdfBuffer = await labResultsPDFGenerator.generateReport(
      user.id,
      resultIds,
      {
        includeTrends,
        includeRecommendations,
        includeReferenceRanges,
        format: 'detailed',
      }
    );

    // Return PDF as response
    // Note: In production, convert HTML to actual PDF using a library like jsPDF or puppeteer
    return new NextResponse(pdfBuffer.toString(), {
      headers: {
        'Content-Type': 'text/html', // Will be 'application/pdf' when converted
        'Content-Disposition': `attachment; filename="lab-results-${new Date().toISOString().split('T')[0]}.html"`,
      },
    });
  } catch (error: any) {
    console.error('Generate lab results PDF error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate lab results report' },
      { status: 500 }
    );
  }
}

