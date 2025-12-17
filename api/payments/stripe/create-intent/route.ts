import { NextRequest, NextResponse } from 'next/server';
import { stripeService } from '@/lib/stripe';
import { authService } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * POST /api/payments/stripe/create-intent
 * Create a payment intent for one-time payment
 */
export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('sessionToken')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await authService.verifySession(sessionToken);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const { amount, currency, description, metadata } = await request.json();

    if (!amount || !currency || !description) {
      return NextResponse.json(
        { error: 'Amount, currency, and description are required' },
        { status: 400 }
      );
    }

    // Validate amount (must be positive)
    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Validate currency
    const validCurrencies = ['usd', 'eur', 'gbp'];
    if (!validCurrencies.includes(currency.toLowerCase())) {
      return NextResponse.json(
        { error: `Currency must be one of: ${validCurrencies.join(', ')}` },
        { status: 400 }
      );
    }

    // Create payment intent
    const paymentIntent = await stripeService.createPaymentIntent(
      user.id,
      amount, // Amount in cents
      currency,
      description,
      metadata
    );

    // Create payment record in database
    await prisma.payment.create({
      data: {
        userId: user.id,
        amount: amount / 100, // Convert from cents to dollars
        currency: currency.toUpperCase(),
        paymentMethod: 'stripe_card',
        type: 'one_time',
        description,
        stripePaymentIntentId: paymentIntent.id,
        status: paymentIntent.status === 'succeeded' ? 'succeeded' : 'pending',
        metadata: metadata || {},
      },
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}

