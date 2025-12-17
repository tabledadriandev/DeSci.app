import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recordId, providerId } = body;

    if (!recordId || !providerId) {
      return NextResponse.json(
        { error: 'recordId and providerId are required' },
        { status: 400 },
      );
    }

    const provider = await prisma.healthcareProvider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 },
      );
    }

    const record = await prisma.medicalRecord.findUnique({
      where: { id: recordId },
    });

    if (!record) {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 },
      );
    }

    const updated = await prisma.medicalRecord.update({
      where: { id: recordId },
      data: {
        sharedWithProviderIds: Array.from(
          new Set([...(record.sharedWithProviderIds ?? []), providerId]),
        ),
      },
    });

    return NextResponse.json({ success: true, record: updated });
  } catch (error: any) {
    console.error('Error sharing medical record:', error);
    return NextResponse.json(
      { error: 'Failed to share record', details: error.message },
      { status: 500 },
    );
  }
}


