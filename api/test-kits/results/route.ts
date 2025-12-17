import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BiomarkerInterpretationModule } from '@/lib/ai-coach/modules';

export const dynamic = 'force-dynamic';

// POST: Upload test results
export async function POST(request: NextRequest) {
  try {
    const {
      userId,
      orderId,
      testType,
      testName,
      resultsData,
      provider,
      providerResultId,
      providerReportUrl,
      sampleCollectedAt,
      sampleReceivedAt,
      processingCompletedAt,
    } = await request.json();

    if (!userId || !testType || !resultsData) {
      return NextResponse.json(
        { error: 'User ID, test type, and results data are required' },
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

    // Verify order if provided
    if (orderId) {
      const order = await prisma.testOrder.findUnique({
        where: { id: orderId },
      });

      if (!order || order.userId !== user.id) {
        return NextResponse.json(
          { error: 'Invalid order reference' },
          { status: 400 }
        );
      }
    }

    // Process results based on test type
    const biomarkerEntries = await processTestResults(testType, resultsData);

    // Create test result
    const testResult = await prisma.testResult.create({
      data: {
        userId: user.id,
        orderId: orderId || null,
        testType,
        testName: testName || `${testType} test`,
        resultsData,
        // Store processed biomarker entries as JSON if present
        biomarkerEntries: biomarkerEntries ?? undefined,
        provider: provider || null,
        providerResultId: providerResultId || null,
        providerReportUrl: providerReportUrl || null,
        sampleCollectedAt: sampleCollectedAt ? new Date(sampleCollectedAt) : null,
        sampleReceivedAt: sampleReceivedAt ? new Date(sampleReceivedAt) : null,
        processingCompletedAt: processingCompletedAt ? new Date(processingCompletedAt) : null,
        status: 'completed',
        recommendations: [],
      },
    });

    // Create biomarker entries if processed
    if (biomarkerEntries && Array.isArray(biomarkerEntries)) {
      for (const entry of biomarkerEntries) {
        await prisma.biomarker.create({
          data: {
            // Link to user via relation
            user: {
              connect: { id: user.id },
            },
            ...entry,
            labDate: processingCompletedAt ? new Date(processingCompletedAt) : new Date(),
            source: 'lab',
            notes: `From ${testName || testType} test result`,
            // Required JSON field, store entry metadata if present
            customValues: [],
          },
        });
      }
    }

    // Generate AI recommendations
    const recommendations = await generateRecommendations(testType, resultsData, biomarkerEntries);

    // Update test result with recommendations
    if (recommendations.length > 0) {
      await prisma.testResult.update({
        where: { id: testResult.id },
        data: {
          recommendations,
        },
      });
    }

    return NextResponse.json({
      success: true,
      testResult: {
        ...testResult,
        recommendations,
      },
      biomarkersCreated: biomarkerEntries?.length || 0,
      message: 'Test results uploaded and processed successfully',
    });
  } catch (error: any) {
    console.error('Upload test results error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload test results' },
      { status: 500 }
    );
  }
}

// GET: Get test results for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const testType = searchParams.get('testType');
    const orderId = searchParams.get('orderId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    const where: any = {};
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

    where.userId = user.id;

    if (testType) {
      where.testType = testType;
    }

    if (orderId) {
      where.orderId = orderId;
    }

    const results = await prisma.testResult.findMany({
      where,
      include: {
        order: {
          include: {
            kit: {
              select: {
                name: true,
                kitType: true,
                category: true,
              },
            },
          },
        },
      },
      orderBy: { processingCompletedAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error: any) {
    console.error('Get test results error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get test results' },
      { status: 500 }
    );
  }
}

/**
 * Process test results and extract biomarker data
 */
async function processTestResults(testType: string, resultsData: any): Promise<any[] | null> {
  const biomarkerEntries: any[] = [];

  if (testType === 'blood') {
    // Process blood test results
    if (resultsData.bloodGlucose) {
      biomarkerEntries.push({
        bloodGlucose: parseFloat(resultsData.bloodGlucose),
      });
    }
    if (resultsData.cholesterolTotal) {
      biomarkerEntries.push({
        cholesterolTotal: parseFloat(resultsData.cholesterolTotal),
        cholesterolLDL: resultsData.cholesterolLDL ? parseFloat(resultsData.cholesterolLDL) : null,
        cholesterolHDL: resultsData.cholesterolHDL ? parseFloat(resultsData.cholesterolHDL) : null,
        triglycerides: resultsData.triglycerides ? parseFloat(resultsData.triglycerides) : null,
      });
    }
    if (resultsData.vitaminD) {
      biomarkerEntries.push({
        vitaminD: parseFloat(resultsData.vitaminD),
      });
    }
    if (resultsData.vitaminB12) {
      biomarkerEntries.push({
        vitaminB12: parseFloat(resultsData.vitaminB12),
      });
    }
    if (resultsData.testosterone) {
      biomarkerEntries.push({
        testosterone: parseFloat(resultsData.testosterone),
      });
    }
    if (resultsData.cortisol) {
      biomarkerEntries.push({
        cortisol: parseFloat(resultsData.cortisol),
      });
    }
    // Add more biomarker mappings as needed
  }

  return biomarkerEntries.length > 0 ? biomarkerEntries : null;
}

/**
 * Generate AI recommendations based on test results
 */
async function generateRecommendations(
  testType: string,
  resultsData: any,
  biomarkerEntries: any[] | null
): Promise<string[]> {
  const recommendations: string[] = [];

  // Use biomarker interpretation module if available
  if (biomarkerEntries && biomarkerEntries.length > 0) {
    try {
      const biomarkerModule = new BiomarkerInterpretationModule();
      const interpretation = await biomarkerModule.interpretLabResults(
        biomarkerEntries,
        {} // User context would be passed here
      );
      
      if (interpretation.recommendations) {
        recommendations.push(...interpretation.recommendations);
      }
    } catch (error) {
      console.error('Error generating AI recommendations:', error);
      // Fall through to basic recommendations
    }
  }

  // Basic recommendations if AI fails
  if (recommendations.length === 0) {
    recommendations.push('Review your test results with your healthcare provider.');
    recommendations.push('Continue tracking biomarkers to monitor trends over time.');
  }

  return recommendations;
}

