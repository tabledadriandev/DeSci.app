import { NextRequest, NextResponse } from 'next/server';
import { stripeService } from '@/lib/stripe';
import { authService } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * POST /api/payments/subscriptions/cancel
 * Cancel subscription (at end of period or immediately)
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

    const { subscriptionId, cancelImmediately } = await request.json();

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      );
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        id: subscriptionId,
        userId: user.id,
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    if (subscription.status === 'canceled') {
      return NextResponse.json(
        { error: 'Subscription is already canceled' },
        { status: 400 }
      );
    }

    // Handle crypto subscription cancellation
    if (subscription.paymentMethod === 'crypto') {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'canceled',
          canceledAt: new Date(),
          cancelAtPeriodEnd: !cancelImmediately,
        },
      });

      return NextResponse.json({
        success: true,
        message: cancelImmediately 
          ? 'Subscription canceled immediately' 
          : 'Subscription will be canceled at the end of the current period',
      });
    }

    // Handle Stripe subscription cancellation
    if (subscription.stripeSubscriptionId) {
      const stripeSubscription = await stripeService.cancelSubscription(
        subscription.stripeSubscriptionId,
        !cancelImmediately
      );

      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: stripeSubscription.status,
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
          canceledAt: stripeSubscription.canceled_at 
            ? new Date(stripeSubscription.canceled_at * 1000) 
            : new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: cancelImmediately 
          ? 'Subscription canceled immediately' 
          : 'Subscription will be canceled at the end of the current period',
      });
    }

    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  } catch (error: any) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}

