import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { web3Service } from '@/lib/web3';
import { contractService } from '@/lib/contract-service';

const SERVICES: Record<string, any> = {
  'consultation-15': { name: '15-Minute Consultation', price: 100 },
  'consultation-30': { name: '30-Minute Consultation', price: 200 },
  'consultation-60': { name: '60-Minute Deep Dive', price: 500 },
  'custom-meal-plan': { name: 'Custom Meal Plan Design', price: 1000 },
  'cooking-class': { name: 'Private Cooking Class', price: 1500 },
  'private-dining': { name: 'Private Dining Experience', price: 5000 },
};

export async function POST(request: NextRequest) {
  try {
    const { address, serviceId, dateTime } = await request.json();

    if (!address || !serviceId || !dateTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const service = SERVICES[serviceId];
    if (!service) {
      return NextResponse.json(
        { error: 'Invalid service' },
        { status: 400 }
      );
    }

    // Check balance
    const balance = await web3Service.getBalance(address as `0x${string}`);
    const priceInWei = BigInt(Math.floor(service.price * 1e18));

    if (balance < priceInWei) {
      return NextResponse.json(
        { error: `Insufficient balance. Need ${service.price} $tabledadrian` },
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

    // Create booking (would use ChefBooking table in production)
    // For now, store in a simple structure
    const booking = {
      id: Date.now().toString(),
      userId: user.id,
      serviceId,
      serviceName: service.name,
      dateTime: new Date(dateTime),
      price: service.price,
      status: 'pending',
      createdAt: new Date(),
    };

    // Generate unique booking ID
    const bookingId = `BOOK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Try to process booking on-chain if contract service is available
    let txHash: string | null = null;
    let onChainStatus = 'pending';

    try {
      txHash = await contractService.processBooking(
        address as `0x${string}`,
        bookingId,
        service.price
      );
      onChainStatus = 'confirmed';
    } catch (error: any) {
      console.warn('On-chain booking processing failed, continuing with off-chain:', error.message);
      // Continue with off-chain booking if on-chain fails
      // This allows the system to work even if the backend wallet isn't authorized yet
    }

    // Create transaction
    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: 'purchase',
        amount: -service.price,
        description: `Chef service: ${service.name}`,
        status: onChainStatus,
        txHash: txHash || undefined,
      },
    });

    return NextResponse.json({ 
      success: true, 
      data: {
        ...booking,
        bookingId,
        txHash,
        onChain: !!txHash,
      }
    });
  } catch (error: any) {
    console.error('Error booking service:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to book service' },
      { status: 500 }
    );
  }
}

