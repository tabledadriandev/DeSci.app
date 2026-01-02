import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';
import { stripeService, PRICING_TIERS } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { web3Service } from '@/lib/web3';
import type { SubscriptionTier, BillingCycle } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

/**
 * POST /api/payments/unified
 * Unified payment endpoint - handles both crypto and fiat payments
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

    const { 
      type, // 'subscription' or 'one_time'
      tier, 
      billingCycle, 
      amount, 
      currency,
      description,
      paymentMethod, // 'crypto' or 'fiat'
      walletAddress, // For crypto payments
      paymentMethodId, // For Stripe payments
    } = await request.json();

    if (!type || !paymentMethod) {
      return NextResponse.json(
        { error: 'Type and payment method are required' },
        { status: 400 }
      );
    }

    // Handle subscription payment
    if (type === 'subscription') {
      if (!tier || !billingCycle) {
        return NextResponse.json(
          { error: 'Tier and billing cycle are required for subscriptions' },
          { status: 400 }
        );
      }

      if (paymentMethod === 'crypto') {
        // Crypto subscription payment
        const pricingTiers = PRICING_TIERS as Record<string, Record<string, { crypto?: number; fiat?: number }>>;
        const priceInTA = pricingTiers[tier]?.[billingCycle]?.crypto;
        
        if (!priceInTA) {
          return NextResponse.json(
            { error: 'Invalid tier or billing cycle' },
            { status: 400 }
          );
        }
        
        if (!walletAddress) {
          return NextResponse.json(
            { error: 'Wallet address is required for crypto payments' },
            { status: 400 }
          );
        }

        // Verify wallet balance
        const balance = await web3Service.getBalance(walletAddress as `0x${string}`);
        const priceInWei = BigInt(Math.floor(priceInTA * 1e18));

        if (balance < priceInWei) {
          return NextResponse.json(
            { error: `Insufficient balance. Need ${priceInTA} $tabledadrian tokens.` },
            { status: 400 }
          );
        }

        // TODO: Subscription and Payment models not yet implemented
        return NextResponse.json(
          { error: 'Subscription and Payment models not yet implemented' },
          { status: 501 }
        );
      } else {
        // Fiat subscription payment (use existing subscription create endpoint logic)
        // Redirect to subscription creation
        return NextResponse.json({
          success: true,
          paymentMethod: 'fiat',
          redirectTo: '/api/payments/subscriptions/create',
          message: 'Please use /api/payments/subscriptions/create for fiat subscriptions',
        });
      }
    }

    // Handle one-time payment
    if (type === 'one_time') {
      if (!amount || !currency || !description) {
        return NextResponse.json(
          { error: 'Amount, currency, and description are required for one-time payments' },
          { status: 400 }
        );
      }

      if (paymentMethod === 'crypto') {
        if (!walletAddress) {
          return NextResponse.json(
            { error: 'Wallet address is required for crypto payments' },
            { status: 400 }
          );
        }

        // Verify wallet balance
        const balance = await web3Service.getBalance(walletAddress as `0x${string}`);
        const priceInWei = BigInt(Math.floor(amount * 1e18));

        if (balance < priceInWei) {
          return NextResponse.json(
            { error: `Insufficient balance. Need ${amount} ${currency} tokens.` },
            { status: 400 }
          );
        }

        // TODO: Payment model not yet implemented, use Transaction instead
        const payment = await prisma.transaction.create({
          data: {
            userId: user.id,
            type: 'purchase',
            amount: -amount, // Negative for purchase
            description,
            status: 'pending',
            metadata: {
              currency: currency.toUpperCase(),
              paymentMethod: 'crypto',
            },
          },
        });

        return NextResponse.json({
          success: true,
          paymentMethod: 'crypto',
          payment: {
            id: payment.id,
            amount: Math.abs(payment.amount),
            currency: (payment.metadata as Record<string, unknown>)?.currency as string || 'USD',
            status: payment.status,
          },
          requiresOnChainTransaction: true,
        });
      } else {
        // Fiat one-time payment
        const amountInCents = Math.round(amount * 100); // Convert to cents

        const paymentIntent = await stripeService.createPaymentIntent(
          user.id,
          amountInCents,
          currency.toLowerCase(),
          description
        ) as Record<string, unknown>;

        // TODO: Payment model not yet implemented, use Transaction instead
        await prisma.transaction.create({
          data: {
            userId: user.id,
            type: 'purchase',
            amount: -amount, // Negative for purchase
            description,
            status: (paymentIntent.status as string) === 'succeeded' ? 'completed' : 'pending',
            metadata: {
              currency: currency.toUpperCase(),
              paymentMethod: 'stripe_card',
              stripePaymentIntentId: (paymentIntent.id as string) || null,
            },
          },
        });

        return NextResponse.json({
          success: true,
          paymentMethod: 'fiat',
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
        });
      }
    }

    return NextResponse.json(
      { error: 'Invalid payment type. Must be "subscription" or "one_time"' },
      { status: 400 }
    );
  } catch (error: unknown) {
    console.error('Error processing unified payment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to process payment';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

