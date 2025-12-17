import { NextRequest, NextResponse } from 'next/server';
import { stripeService } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

/**
 * POST /api/payments/stripe/webhook
 * Handle Stripe webhook events
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripeService.verifyWebhookSignature(body, signature);
    } catch (error: any) {
      console.error('Webhook signature verification failed:', error);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentFailed(paymentIntent);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        await handleChargeRefunded(charge);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    const userId = paymentIntent.metadata?.userId;
    if (!userId) {
      console.error('No userId in payment intent metadata');
      return;
    }

    // Update payment record
    await prisma.payment.updateMany({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: {
        status: 'succeeded',
        paidAt: new Date(),
        stripeChargeId: typeof paymentIntent.latest_charge === 'string' 
          ? paymentIntent.latest_charge 
          : paymentIntent.latest_charge?.id || null,
      },
    });

    // Create transaction record
    await prisma.transaction.create({
      data: {
        userId,
        type: 'payment',
        amount: paymentIntent.amount / 100, // Convert from cents
        description: paymentIntent.description || 'Payment',
        status: 'completed',
      },
    });

    console.log(`Payment intent succeeded: ${paymentIntent.id}`);
  } catch (error: any) {
    console.error('Error handling payment intent succeeded:', error);
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    const userId = paymentIntent.metadata?.userId;
    if (!userId) return;

    await prisma.payment.updateMany({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: {
        status: 'failed',
        failureReason: paymentIntent.last_payment_error?.message || 'Payment failed',
      },
    });

    console.log(`Payment intent failed: ${paymentIntent.id}`);
  } catch (error: any) {
    console.error('Error handling payment intent failed:', error);
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  try {
    const userId = subscription.metadata?.userId;
    if (!userId) {
      console.error('No userId in subscription metadata');
      return;
    }

    const tier = subscription.metadata?.tier || 'basic';
    const billingCycle = subscription.metadata?.billingCycle || 'monthly';

    // Update or create subscription record
    await prisma.subscription.upsert({
      where: { stripeSubscriptionId: subscription.id },
      create: {
        userId,
        tier: tier as any,
        billingCycle: billingCycle as any,
        price: subscription.items.data[0]?.price?.unit_amount 
          ? subscription.items.data[0].price.unit_amount / 100 
          : 0,
        currency: subscription.currency?.toUpperCase() || 'USD',
        paymentMethod: 'fiat',
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: typeof subscription.customer === 'string' 
          ? subscription.customer 
          : subscription.customer?.id || null,
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
      update: {
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        canceledAt: subscription.canceled_at 
          ? new Date(subscription.canceled_at * 1000) 
          : null,
      },
    });

    console.log(`Subscription updated: ${subscription.id}`);
  } catch (error: any) {
    console.error('Error handling subscription update:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: 'canceled',
        canceledAt: new Date(),
      },
    });

    console.log(`Subscription deleted: ${subscription.id}`);
  } catch (error: any) {
    console.error('Error handling subscription deleted:', error);
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  try {
    const subscriptionId = typeof invoice.subscription === 'string' 
      ? invoice.subscription 
      : invoice.subscription?.id || null;

    if (subscriptionId) {
      // Update payment record if exists
      await prisma.payment.updateMany({
        where: { stripeInvoiceId: invoice.id },
        data: {
          status: 'succeeded',
          paidAt: new Date(),
          invoiceUrl: invoice.invoice_pdf || null,
          invoiceNumber: invoice.number || null,
        },
      });

      // Create new payment record if doesn't exist
      const existingPayment = await prisma.payment.findFirst({
        where: { stripeInvoiceId: invoice.id },
      });

      if (!existingPayment && invoice.customer) {
        const customerId = typeof invoice.customer === 'string' 
          ? invoice.customer 
          : invoice.customer?.id || null;

        if (customerId) {
          const paymentMethod = await prisma.paymentMethod.findFirst({
            where: { stripeCustomerId: customerId },
          });

          if (paymentMethod) {
            const subscription = await prisma.subscription.findFirst({
              where: { stripeSubscriptionId: subscriptionId },
            });

            if (subscription) {
              await prisma.payment.create({
                data: {
                  userId: subscription.userId,
                  amount: invoice.amount_paid / 100,
                  currency: invoice.currency?.toUpperCase() || 'USD',
                  paymentMethod: 'stripe_card',
                  type: 'subscription',
                  description: `Subscription payment - ${subscription.tier}`,
                  subscriptionId: subscription.id,
                  stripeInvoiceId: invoice.id,
                  stripeChargeId: typeof invoice.charge === 'string' 
                    ? invoice.charge 
                    : invoice.charge?.id || null,
                  status: 'succeeded',
                  paidAt: new Date(),
                  invoiceUrl: invoice.invoice_pdf || null,
                  invoiceNumber: invoice.number || null,
                },
              });
            }
          }
        }
      }
    }

    console.log(`Invoice paid: ${invoice.id}`);
  } catch (error: any) {
    console.error('Error handling invoice paid:', error);
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  try {
    await prisma.payment.updateMany({
      where: { stripeInvoiceId: invoice.id },
      data: {
        status: 'failed',
        failureReason: 'Invoice payment failed',
      },
    });

    // Update subscription status to past_due
    const subscriptionId = typeof invoice.subscription === 'string' 
      ? invoice.subscription 
      : invoice.subscription?.id || null;

    if (subscriptionId) {
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: subscriptionId },
        data: {
          status: 'past_due',
        },
      });
    }

    console.log(`Invoice payment failed: ${invoice.id}`);
  } catch (error: any) {
    console.error('Error handling invoice payment failed:', error);
  }
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  try {
    const payment = await prisma.payment.findFirst({
      where: { stripeChargeId: charge.id },
    });

    if (payment) {
      const refundAmount = charge.amount_refunded / 100; // Convert from cents

      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: refundAmount >= payment.amount ? 'refunded' : 'partially_refunded',
          refundAmount,
          refundedAt: new Date(),
        },
      });

      // Create refund transaction
      await prisma.transaction.create({
        data: {
          userId: payment.userId,
          type: 'refund',
          amount: -refundAmount, // Negative for refund
          description: `Refund for ${payment.description}`,
          status: 'completed',
        },
      });
    }

    console.log(`Charge refunded: ${charge.id}`);
  } catch (error: any) {
    console.error('Error handling charge refunded:', error);
  }
}

