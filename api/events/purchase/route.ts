import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { web3Service } from '@/lib/web3';
import { contractService } from '@/lib/contract-service';

const EVENTS: Record<string, any> = {
  'exclusive-dinner-2024': {
    name: 'Exclusive Chef Dinner Experience',
    price: 500,
  },
  'cooking-masterclass-2024': {
    name: 'Cooking Masterclass',
    price: 300,
  },
  'wine-pairing-2024': {
    name: 'Wine & Food Pairing Evening',
    price: 400,
  },
};

export async function POST(request: NextRequest) {
  try {
    const { address, eventId, quantity = 1 } = await request.json();

    if (!address || !eventId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const event = EVENTS[eventId];
    if (!event) {
      return NextResponse.json(
        { error: 'Invalid event' },
        { status: 400 }
      );
    }

    const totalPrice = event.price * quantity;

    // Check balance
    const balance = await web3Service.getBalance(address as `0x${string}`);
    const priceInWei = BigInt(Math.floor(totalPrice * 1e18));

    if (balance < priceInWei) {
      return NextResponse.json(
        { error: `Insufficient balance. Need ${totalPrice} $TA` },
        { status: 400 }
      );
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { walletAddress: address },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { walletAddress: address },
      });
    }

    // Generate unique ticket IDs
    const ticketIds: string[] = [];
    for (let i = 0; i < quantity; i++) {
      ticketIds.push(`TICKET-${eventId}-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`);
    }

    // Process tickets on-chain
    const txHashes: string[] = [];
    let onChainStatus = 'pending';

    for (const ticketId of ticketIds) {
      try {
        const txHash = await contractService.processEventTicket(
          address as `0x${string}`,
          ticketId,
          event.price
        );
        txHashes.push(txHash);
        onChainStatus = 'confirmed';
      } catch (error: any) {
        console.warn(`On-chain ticket processing failed for ${ticketId}:`, error.message);
        // Continue with off-chain if on-chain fails
      }
    }

    // Create transaction
    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: 'purchase',
        amount: -totalPrice,
        description: `Event ticket: ${event.name} (${quantity}x)`,
        status: onChainStatus,
        txHash: txHashes.length > 0 ? txHashes[0] : undefined,
      },
    });

    // In production, create EventTicket records in database
    const tickets = ticketIds.map((ticketId, index) => ({
      id: ticketId,
      userId: user.id,
      eventId,
      eventName: event.name,
      price: event.price,
      txHash: txHashes[index] || null,
      purchasedAt: new Date(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        tickets,
        totalPrice,
        txHashes: txHashes.length > 0 ? txHashes : null,
        onChain: txHashes.length > 0,
      },
    });
  } catch (error: any) {
    console.error('Error purchasing event ticket:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to purchase ticket' },
      { status: 500 }
    );
  }
}

