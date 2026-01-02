/**
 * Medical Results Upload
 * Accepts PDF or image upload for biomarker extraction
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds for OCR processing

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const testDate = formData.get('testDate') as string;
    const labName = formData.get('labName') as string;

    if (!file || !userId) {
      return NextResponse.json(
        { error: 'Missing file or userId' },
        { status: 400 }
      );
    }

    // Validate file type
    const fileType = file.type;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload JPG, PNG, or PDF' },
        { status: 400 }
      );
    }

    // In production, upload to cloud storage (S3, Cloudinary, etc.)
    // For now, convert to base64 for processing
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const dataUrl = `data:${fileType};base64,${base64}`;

    // Return file info - actual extraction happens in /api/medical/extract
    return NextResponse.json({
      success: true,
      data: {
        fileId: `temp_${Date.now()}`,
        fileName: file.name,
        fileSize: file.size,
        fileType,
        testDate: testDate || new Date().toISOString(),
        labName: labName || null,
        // In production, return cloud storage URL instead of base64
        dataUrl, // Temporary - would be cloud URL in production
      },
    });
  } catch (error) {
    console.error('Medical upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Medical upload failed';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
