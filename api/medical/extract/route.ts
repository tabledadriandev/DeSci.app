/**
 * Medical Results Extraction
 * Uses Tesseract.js for OCR and AI parsing for biomarkers
 */

import { NextRequest, NextResponse } from 'next/server';
import { medicalExtractionClient } from '@/lib/ai/medicalExtraction';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const maxDuration = 120; // 2 minutes for OCR

export async function POST(request: NextRequest) {
  try {
    const { dataUrl, userId, testDate, labName, testType } = await request.json();

    if (!dataUrl || !userId) {
      return NextResponse.json(
        { error: 'Missing dataUrl or userId' },
        { status: 400 }
      );
    }

    // Extract text from image using OCR
    const extractedText = await medicalExtractionClient.extractFromImage(dataUrl);

    // Parse biomarkers from text
    const biomarkers = await medicalExtractionClient.parseBiomarkers(extractedText);

    // Get user info for range comparison
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Compare to healthy ranges (would use user's age/gender)
    const comparisons = await medicalExtractionClient.compareToRanges(
      biomarkers,
      user.biologicalAge || 40, // Default age if not set
      'unknown' // Would get from user profile
    );

    // Flag anomalies
    const flagged = await medicalExtractionClient.flagAnomalies(biomarkers);

    // Store in database
    const medicalResult = await prisma.medicalResult.create({
      data: {
        userId,
        pdfUrl: dataUrl, // In production, would be cloud storage URL
        extractedData: { text: extractedText },
        biomarkers: biomarkers.map(b => ({
          name: b.name,
          value: b.value,
          unit: b.unit,
          flag: b.flag,
        })),
        testDate: testDate ? new Date(testDate) : new Date(),
        testType: testType || 'blood',
        labName: labName || null,
        flags: {
          red: flagged.red.length,
          yellow: flagged.yellow.length,
          green: flagged.green.length,
        },
      },
    });

    // Calculate token reward
    const tokenReward = 5; // 5 $TA for medical result upload

    // Record DeSci contribution
    await prisma.deSciContribution.create({
      data: {
        userId,
        dataPoints: biomarkers.length,
        tokenReward,
        researchStudy: 'medical_result_upload',
      },
    });

    // Update user's total tokens
    await prisma.user.update({
      where: { id: userId },
      data: {
        totalTokensEarned: { increment: tokenReward },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        medicalResultId: medicalResult.id,
        biomarkers,
        comparisons,
        flagged,
        tokenReward,
      },
    });
  } catch (error) {
    console.error('Medical extraction error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Medical extraction failed';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
