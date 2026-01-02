/**
 * Food Identification API
 * Accepts image upload and returns AI-identified foods
 */

import { NextRequest, NextResponse } from 'next/server';
import { createFoodVisionClient } from '@/lib/ai/foodVision';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const userId = formData.get('userId') as string;

    if (!file || !userId) {
      return NextResponse.json(
        { error: 'Missing image or userId' },
        { status: 400 }
      );
    }

    // Check OpenAI API key
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Upload image to temporary storage or convert to data URL
    // For now, we'll assume the image is already uploaded and we have a URL
    // In production, you'd upload to S3/Cloudinary/etc. first
    const imageBuffer = await file.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString('base64');
    const imageUrl = `data:${file.type};base64,${imageBase64}`;

    // Create food vision client
    const foodClient = createFoodVisionClient(openaiKey);

    // Identify foods
    const identification = await foodClient.identifyFood(imageUrl);

    return NextResponse.json({
      success: true,
      data: identification,
    });
  } catch (error) {
    console.error('Food identification error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Food identification failed';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
