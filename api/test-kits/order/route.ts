import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripeService } from '@/lib/stripe';
import { web3Service } from '@/lib/web3';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const {
      userId,
      kitId,
      quantity = 1,
      shippingAddress,
      paymentMethod, // 'crypto' or 'fiat'
      paymentMethodId, // For fiat payments
    } = await request.json();

    if (!userId || !kitId || !shippingAddress) {
      return NextResponse.json(
        { error: 'User ID, kit ID, and shipping address are required' },
        { status: 400 }
      );
    }

    // Get test kit
    const kit = await prisma.testKit.findUnique({
      where: { id: kitId },
    });

    if (!kit || !kit.isAvailable) {
      return NextResponse.json(
        { error: 'Test kit not found or not available' },
        { status: 404 }
      );
    }

    // Check stock if tracked
    if (kit.stockCount !== null && kit.stockCount < quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock available' },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ walletAddress: userId }, { email: userId }],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Determine price and currency
    const currency = paymentMethod === 'fiat' ? 'USD' : 'TA';
    const price = currency === 'USD' ? kit.priceInUSD : kit.priceInTA;

    if (!price || price <= 0) {
      return NextResponse.json(
        { error: 'Test kit price not available for selected payment method' },
        { status: 400 }
      );
    }

    const totalPrice = price * quantity;

    // Process payment
    let paymentId: string | null = null;
    let txHash: string | null = null;
    let stripePaymentIntentId: string | null = null;
    let paymentStatus = 'pending';

    if (paymentMethod === 'crypto') {
      // Check crypto balance
      if (user.walletAddress) {
        const balance = await web3Service.getBalance(user.walletAddress as `0x${string}`);
        const priceInWei = BigInt(Math.floor(totalPrice * 1e18));
        
        if (balance < priceInWei) {
          return NextResponse.json(
            { error: `Insufficient balance. Need ${totalPrice} $TA` },
            { status: 400 }
          );
        }

        // TODO: Process actual crypto payment
        // For now, we'll mark as pending and process separately
        paymentStatus = 'pending';
      }
    } else if (paymentMethod === 'fiat') {
      // Create Stripe payment intent
      try {
        const paymentIntent = await stripeService.createPaymentIntent(
          user.id,
          Math.round(totalPrice * 100), // Convert to cents
          'usd',
          `Test Kit Order: ${kit.name}`,
          {
            kitId,
            quantity: quantity.toString(),
          }
        );

        stripePaymentIntentId = paymentIntent.id;
        paymentStatus = 'pending';
      } catch (error: any) {
        return NextResponse.json(
          { error: `Payment processing failed: ${error.message}` },
          { status: 500 }
        );
      }
    }

    // Create order
    const order = await prisma.testOrder.create({
      data: {
        userId: user.id,
        kitId: kit.id,
        quantity,
        shippingAddress,
        price: totalPrice,
        currency,
        paymentMethod: paymentMethod || null,
        paymentId: paymentId || null,
        txHash: txHash || null,
        stripePaymentIntentId: stripePaymentIntentId || null,
        status: paymentStatus === 'succeeded' ? 'paid' : 'pending',
        kitSnapshot: {
          name: kit.name,
          kitType: kit.kitType,
          category: kit.category,
          biomarkersTested: kit.biomarkersTested,
          sampleType: kit.sampleType,
          processingTime: kit.processingTime,
          provider: kit.provider,
        },
      },
    });

    // Update stock if tracked
    if (kit.stockCount !== null) {
      await prisma.testKit.update({
        where: { id: kitId },
        data: {
          stockCount: {
            decrement: quantity,
          },
        },
      });
    }

    // Create payment record
    await prisma.payment.create({
      data: {
        userId: user.id,
        amount: -totalPrice,
        currency,
        paymentMethod: paymentMethod || 'unknown',
        type: 'one_time',
        description: `Test Kit Order: ${kit.name} (x${quantity})`,
        status: paymentStatus,
        stripePaymentIntentId: stripePaymentIntentId || null,
        txHash: txHash || null,
      },
    });

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        kit: {
          name: kit.name,
          kitType: kit.kitType,
        },
      },
      paymentIntent: paymentMethod === 'fiat' && stripePaymentIntentId ? {
        clientSecret: stripePaymentIntentId, // In real implementation, return actual client secret
        paymentIntentId: stripePaymentIntentId,
      } : null,
      message: paymentStatus === 'pending' 
        ? 'Order created. Please complete payment to confirm.' 
        : 'Order created and payment processed successfully.',
    });
  } catch (error: any) {
    console.error('Test kit order error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create test kit order' },
      { status: 500 }
    );
  }
}

