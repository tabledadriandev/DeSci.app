import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decryptMessage } from '@/lib/messaging/encryption';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { viewerAddress, otherPartyAddress } = await request.json();

    if (!viewerAddress || !otherPartyAddress) {
      return NextResponse.json(
        { error: 'viewerAddress and otherPartyAddress are required' },
        { status: 400 },
      );
    }

    const viewer = await prisma.user.findUnique({
      where: { walletAddress: viewerAddress },
    });
    const other = await prisma.user.findUnique({
      where: { walletAddress: otherPartyAddress },
    });

    if (!viewer || !other) {
      return NextResponse.json({ messages: [] });
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: viewer.id, recipientId: other.id },
          { senderId: other.id, recipientId: viewer.id },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });

    const participants = [
      viewerAddress.toLowerCase(),
      otherPartyAddress.toLowerCase(),
    ].sort();
    const sharedKey = participants.join('|');

    const decrypted = await Promise.all(
      messages.map(async (m) => ({
        id: m.id,
        fromViewer: m.senderId === viewer.id,
        content: await decryptMessage(m.content, sharedKey),
        createdAt: m.createdAt,
      })),
    );

    return NextResponse.json({ messages: decrypted });
  } catch (error: any) {
    console.error('Error loading thread:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load thread' },
      { status: 500 },
    );
  }
}


