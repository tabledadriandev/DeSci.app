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
    const where: any = {
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

    // Get test kits
    const testKits = await prisma.testKit.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Filter by price range if specified
    const filteredKits = (minPrice || maxPrice)
      ? testKits.filter((kit: typeof testKits[number]) => {
        const price = currency === 'TA' ? kit.priceInTA : kit.priceInUSD;
        if (!price) return false;
        if (minPrice && price < parseFloat(minPrice)) return false;
        if (maxPrice && price > parseFloat(maxPrice)) return false;
        return true;
      })
      : testKits;

    // Format response with pricing based on currency
    const formattedKits = filteredKits.map((kit: typeof filteredKits[number]) => ({
      id: kit.id,
      name: kit.name,
      description: kit.description,
      kitType: kit.kitType,
      category: kit.category,
      biomarkersTested: kit.biomarkersTested,
      price: currency === 'TA' ? kit.priceInTA : kit.priceInUSD,
      currency,
      sampleType: kit.sampleType,
      processingTime: kit.processingTime,
      provider: kit.provider,
      instructions: kit.instructions,
      videoUrl: kit.videoUrl,
      imageUrl: kit.imageUrl,
      categoryTags: kit.categoryTags,
      stockCount: kit.stockCount,
      createdAt: kit.createdAt,
    }));

    return NextResponse.json({
      success: true,
      testKits: formattedKits,
    });
  } catch (error: any) {
    console.error('Get test kits error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get test kits' },
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

    const testKit = await prisma.testKit.create({
      data: {
        name,
        description,
        kitType,
        category,
        biomarkersTested: biomarkersTested || [],
        priceInTA: priceInTA || null,
        priceInUSD: priceInUSD || null,
        sampleType,
        processingTime: processingTime || null,
        provider: provider || null,
        providerId: providerId || null,
        instructions: instructions || null,
        videoUrl: videoUrl || null,
        imageUrl: imageUrl || null,
        categoryTags: categoryTags || [],
        stockCount: stockCount || null,
        isAvailable: true,
      },
    });

    return NextResponse.json({
      success: true,
      testKit,
    });
  } catch (error: any) {
    console.error('Create test kit error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create test kit' },
      { status: 500 }
    );
  }
}

