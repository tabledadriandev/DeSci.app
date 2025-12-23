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
        const priceInTA = (PRICING_TIERS as any)[tier][billingCycle].crypto;
        
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

        // Create subscription record (payment will be processed on-chain)
        const subscription = await prisma.subscription.create({
          data: {
            userId: user.id,
            tier: tier as SubscriptionTier,
            billingCycle: billingCycle as BillingCycle,
            price: priceInTA,
            currency: 'TA',
            paymentMethod: 'crypto',
            status: 'pending',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(
              Date.now() + (billingCycle === 'monthly' ? 30 * 24 * 60 * 60 * 1000 : 365 * 24 * 60 * 60 * 1000)
            ),
          },
        });

        // Create payment record
        await prisma.payment.create({
          data: {
            userId: user.id,
            amount: priceInTA,
            currency: 'TA',
            paymentMethod: 'crypto',
            type: 'subscription',
            description: `${tier} subscription - ${billingCycle}`,
            subscriptionId: subscription.id,
            status: 'pending',
          },
        });

        return NextResponse.json({
          success: true,
          paymentMethod: 'crypto',
          subscription: {
            id: subscription.id,
            tier: subscription.tier,
            billingCycle: subscription.billingCycle,
            price: subscription.price,
            currency: subscription.currency,
            status: subscription.status,
          },
          requiresOnChainTransaction: true,
          amount: priceInTA,
          currency: 'TA',
        });
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

        // Create payment record
        const payment = await prisma.payment.create({
          data: {
            userId: user.id,
            amount,
            currency: currency.toUpperCase(),
            paymentMethod: 'crypto',
            type: 'one_time',
            description,
            status: 'pending',
          },
        });

        return NextResponse.json({
          success: true,
          paymentMethod: 'crypto',
          payment: {
            id: payment.id,
            amount: payment.amount,
            currency: payment.currency,
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
        );

        // Create payment record
        await prisma.payment.create({
          data: {
            userId: user.id,
            amount: amount,
            currency: currency.toUpperCase(),
            paymentMethod: 'stripe_card',
            type: 'one_time',
            description,
            stripePaymentIntentId: paymentIntent.id,
            status: paymentIntent.status === 'succeeded' ? 'succeeded' : 'pending',
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
  } catch (error: any) {
    console.error('Error processing unified payment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process payment' },
      { status: 500 }
    );
  }
}

