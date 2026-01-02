import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // product, service, subscription, treatment
    const category = searchParams.get('category'); // supplements, devices, etc.

    const where: {
      isActive: boolean;
      type?: string;
      category?: string;
    } = { isActive: true };
    if (type) where.type = type;
    if (category) where.category = category;

    // TODO: MarketplaceItem model not yet implemented
    const items: unknown[] = [];

    return NextResponse.json(items);
  } catch (error: unknown) {
    console.error('Error fetching marketplace items:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch items';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

