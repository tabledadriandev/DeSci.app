import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encryptMessage } from '@/lib/messaging/encryption';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { senderAddress, recipientAddress, content } = await request.json();

    if (!senderAddress || !recipientAddress || !content) {
      return NextResponse.json(
        { error: 'senderAddress, recipientAddress and content are required' },
        { status: 400 },
      );
    }

    let sender = await prisma.user.findUnique({
      where: { walletAddress: senderAddress },
    });
    if (!sender) {
      sender = await prisma.user.create({
        data: { walletAddress: senderAddress },
      });
    }

    let recipient = await prisma.user.findUnique({
      where: { walletAddress: recipientAddress },
    });
    if (!recipient) {
      recipient = await prisma.user.create({
        data: { walletAddress: recipientAddress },
      });
    }

    // Derive a very simple shared key from sorted wallet addresses for demo purposes.
    const participants = [senderAddress.toLowerCase(), recipientAddress.toLowerCase()].sort();
    const sharedKey = participants.join('|');

    const encryptedContent = await encryptMessage(content, sharedKey);

    const message = await prisma.message.create({
      data: {
        senderId: sender.id,
        recipientId: recipient.id,
        content: encryptedContent,
      },
    });

    return NextResponse.json({ success: true, id: message.id });
  } catch (error: any) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send message' },
      { status: 500 },
    );
  }
}


