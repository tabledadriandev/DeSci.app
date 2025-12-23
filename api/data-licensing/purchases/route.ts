import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/data-licensing/purchases
 * Lists data licensing purchases for research/admin console.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const purchaserType = searchParams.get('purchaserType');
    const status = searchParams.get('status');

    const where: any = {};
    if (purchaserType) where.purchaserType = purchaserType;
    if (status) where.status = status;

    const purchases = await prisma.dataLicensePurchase.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ purchases });
  } catch (error: any) {
    console.error('Error listing data license purchases:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list data license purchases' },
      { status: 500 },
    );
  }
}


