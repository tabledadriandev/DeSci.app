import { NextRequest, NextResponse } from 'next/server';
import { stripeService, PRICING_TIERS } from '@/lib/stripe';
import { authService } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { SubscriptionTier, BillingCycle } from '@/lib/stripe';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

/**
 * POST /api/payments/subscriptions/create
 * Create a new subscription
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

    const { tier, billingCycle, paymentMethodId, paymentMethodType } = await request.json();

    if (!tier || !billingCycle) {
      return NextResponse.json(
        { error: 'Tier and billing cycle are required' },
        { status: 400 }
      );
    }

    // Validate tier
    const validTiers: SubscriptionTier[] = ['basic', 'premium', 'concierge'];
    if (!validTiers.includes(tier)) {
      return NextResponse.json(
        { error: `Tier must be one of: ${validTiers.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate billing cycle
    const validBillingCycles: BillingCycle[] = ['monthly', 'yearly'];
    if (!validBillingCycles.includes(billingCycle)) {
      return NextResponse.json(
        { error: `Billing cycle must be one of: ${validBillingCycles.join(', ')}` },
        { status: 400 }
      );
    }

    // Check if user already has an active subscription
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: 'active',
      },
    });

    if (existingSubscription) {
      return NextResponse.json(
        { error: 'You already have an active subscription. Cancel it first or update it.' },
        { status: 400 }
      );
    }

    // Handle crypto payment
    if (paymentMethodType === 'crypto') {
      // Create subscription record for crypto (handled separately)
      const priceInTA = (PRICING_TIERS as any)[tier][billingCycle].crypto;

      const subscription = await prisma.subscription.create({
        data: {
          userId: user.id,
          tier: tier as SubscriptionTier,
          billingCycle: billingCycle as BillingCycle,
          price: priceInTA,
          currency: 'TA',
          paymentMethod: 'crypto',
          status: 'pending', // Will be activated after crypto payment is confirmed
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(
            Date.now() + (billingCycle === 'monthly' ? 30 * 24 * 60 * 60 * 1000 : 365 * 24 * 60 * 60 * 1000)
          ),
        },
      });

      return NextResponse.json({
        success: true,
        subscription: {
          id: subscription.id,
          tier: subscription.tier,
          billingCycle: subscription.billingCycle,
          price: subscription.price,
          currency: subscription.currency,
          status: subscription.status,
          requiresPayment: true,
          paymentAmount: priceInTA,
          paymentCurrency: 'TA',
        },
      });
    }

    // Handle fiat payment (Stripe)
    if (paymentMethodType === 'fiat') {
      // Create Stripe subscription
      const subscription = await stripeService.createSubscription(
        user.id,
        tier as SubscriptionTier,
        billingCycle as BillingCycle,
        paymentMethodId
      );

      // Get user's email for Stripe customer
      const userEmail = user.email || undefined;
      const customerId = await stripeService.getOrCreateCustomer(user.id, userEmail, user.username || undefined);

      // Create subscription record in database (webhook will update it)
      const dbSubscription = await prisma.subscription.create({
        data: {
          userId: user.id,
          tier: tier as SubscriptionTier,
          billingCycle: billingCycle as BillingCycle,
          price: (PRICING_TIERS as any)[tier][billingCycle].fiat / 100,
          currency: 'USD',
          paymentMethod: 'fiat',
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: customerId,
          stripePriceId: subscription.items.data[0]?.price?.id || null,
          status: subscription.status,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          trialStart: subscription.trial_start 
            ? new Date(subscription.trial_start * 1000) 
            : null,
          trialEnd: subscription.trial_end 
            ? new Date(subscription.trial_end * 1000) 
            : null,
        },
      });

      // Get client secret from latest invoice
      const invoice = subscription.latest_invoice as any;
      const paymentIntent = invoice?.payment_intent as any;
      const clientSecret = typeof paymentIntent === 'string' 
        ? null 
        : paymentIntent?.client_secret || null;

      return NextResponse.json({
        success: true,
        subscription: {
          id: dbSubscription.id,
          stripeSubscriptionId: subscription.id,
          tier: dbSubscription.tier,
          billingCycle: dbSubscription.billingCycle,
          price: dbSubscription.price,
          currency: dbSubscription.currency,
          status: dbSubscription.status,
          currentPeriodEnd: dbSubscription.currentPeriodEnd,
          clientSecret, // For confirming payment
        },
      });
    }

    return NextResponse.json(
      { error: 'Payment method type must be "crypto" or "fiat"' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create subscription' },
      { status: 500 }
    );
  }
}

