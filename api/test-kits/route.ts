import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: Get all available test kits (marketplace)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const kitType = searchParams.get('kitType'); // 'blood', 'microbiome', 'dna', 'microfluidic'
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const provider = searchParams.get('provider');
    const currency = searchParams.get('currency') || 'TA'; // 'TA' or 'USD'
    
    // Build filter
    const where: { isAvailable: boolean; kitType?: string; category?: string; provider?: string } = {
      isAvailable: true,
    };

    if (kitType) {
      where.kitType = kitType;
    }

    if (category) {
      where.category = category;
    }

    if (provider) {
      where.provider = provider;
    }

    // TODO: TestKit model not yet implemented
    const testKits: unknown[] = [];

    return NextResponse.json({
      success: true,
      testKits,
    });
  } catch (error: unknown) {
    console.error('Get test kits error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to get test kits';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// POST: Create a new test kit (admin function)
export async function POST(request: NextRequest) {
  try {
    const {
      name,
      description,
      kitType,
      category,
      biomarkersTested,
      priceInTA,
      priceInUSD,
      sampleType,
      processingTime,
      provider,
      providerId,
      instructions,
      videoUrl,
      imageUrl,
      categoryTags,
      stockCount,
    } = await request.json();

    if (!name || !kitType || !category || !sampleType) {
      return NextResponse.json(
        { error: 'Name, kit type, category, and sample type are required' },
        { status: 400 }
      );
    }

    // TODO: TestKit model not yet implemented
    return NextResponse.json(
      { error: 'TestKit model not yet implemented' },
      { status: 501 }
    );
  } catch (error: unknown) {
    console.error('Create test kit error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create test kit';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

