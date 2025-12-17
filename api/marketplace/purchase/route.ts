import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { web3Service } from '@/lib/web3';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { address, itemId } = await request.json();

    if (!address || !itemId) {
      return NextResponse.json(
        { error: 'Address and item ID required' },
        { status: 400 }
      );
    }

    // Get item
    const item = await prisma.marketplaceItem.findUnique({
      where: { id: itemId },
    });

    if (!item || !item.isActive) {
      return NextResponse.json(
        { error: 'Item not available' },
        { status: 400 }
      );
    }

    // Check stock
    if (item.stock !== null && item.stock <= 0) {
      return NextResponse.json(
        { error: 'Item out of stock' },
        { status: 400 }
      );
    }

    // Check user balance
    const balance = await web3Service.getBalance(address as `0x${string}`);
    const priceInWei = BigInt(Math.floor(item.price * 1e18));
    
    if (balance < priceInWei) {
      return NextResponse.json(
        { error: 'Insufficient $TA balance' },
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

    // Create transaction record
    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: 'purchase',
        amount: -item.price, // Negative for purchase
        description: `Purchased ${item.name}`,
        status: 'pending', // Would be updated after on-chain confirmation
      },
    });

    // Update stock
    if (item.stock !== null) {
      await prisma.marketplaceItem.update({
        where: { id: itemId },
        data: { stock: { decrement: 1 } },
      });
    }

    // In production, this would trigger an on-chain transaction
    // For now, we just record it in the database

    return NextResponse.json({
      success: true,
      message: 'Purchase initiated. Please confirm the transaction in your wallet.',
    });
  } catch (error: any) {
    console.error('Error processing purchase:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process purchase' },
      { status: 500 }
    );
  }
}

