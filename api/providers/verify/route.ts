import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { providerId, verified } = body;

    if (!providerId) {
      return NextResponse.json(
        { error: 'providerId is required' },
        { status: 400 },
      );
    }

    const updated = await prisma.healthcareProvider.update({
      where: { id: providerId },
      data: {
        licenseVerified: !!verified,
      },
    });

    return NextResponse.json({ success: true, provider: updated });
  } catch (error: any) {
    console.error('Error verifying provider:', error);
    return NextResponse.json(
      { error: 'Failed to verify provider', details: error.message },
      { status: 500 },
    );
  }
}


