import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest) {
  try {
    const providers = await prisma.healthcareProvider.findMany({
      where: {
        telemedicine: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });

    return NextResponse.json({ success: true, providers });
  } catch (error: any) {
    console.error('Error listing providers:', error);
    return NextResponse.json(
      { error: 'Failed to list providers', details: error.message },
      { status: 500 },
    );
  }
}


