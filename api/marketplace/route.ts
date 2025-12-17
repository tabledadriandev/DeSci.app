import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // product, service, subscription, treatment
    const category = searchParams.get('category'); // supplements, devices, etc.

    const where: any = { isActive: true };
    if (type) where.type = type;
    if (category) where.category = category;

    const items = await prisma.marketplaceItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(items);
  } catch (error: any) {
    console.error('Error fetching marketplace items:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch items' },
      { status: 500 }
    );
  }
}

