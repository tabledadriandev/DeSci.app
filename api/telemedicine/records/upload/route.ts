import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, description, fileUrl, providerId } = body;

    if (!userId || !title) {
      return NextResponse.json(
        { error: 'userId and title are required' },
        { status: 400 },
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { walletAddress: userId },
          { email: userId },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 },
      );
    }

    const record = await prisma.medicalRecord.create({
      data: {
        userId: user.id,
        providerId: providerId ?? null,
        title,
        description: description ?? null,
        fileUrl: fileUrl ?? null,
        sharedWithProviderIds: [],
      },
    });

    return NextResponse.json({ success: true, record });
  } catch (error: any) {
    console.error('Error uploading medical record:', error);
    return NextResponse.json(
      { error: 'Failed to upload record', details: error.message },
      { status: 500 },
    );
  }
}


