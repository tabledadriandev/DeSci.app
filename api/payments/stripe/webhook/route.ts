import { NextRequest, NextResponse } from 'next/server';
import { stripeService } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
// TODO: Install stripe package: npm install stripe
// import Stripe from 'stripe';
type Stripe = any; // Temporary type until stripe package is installed

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
    let event: unknown; // Stripe.Event type
    try {
      event = stripeService.verifyWebhookSignature(body, signature);
    } catch (error: unknown) {
      console.error('Webhook signature verification failed:', error);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    // Handle different event types
    const stripeEvent = event as { type: string; data: { object: unknown } };
    switch (stripeEvent.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = stripeEvent.data.object as unknown; // Stripe.PaymentIntent
        await handlePaymentIntentSucceeded(paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = stripeEvent.data.object as unknown; // Stripe.PaymentIntent
        await handlePaymentIntentFailed(paymentIntent);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = stripeEvent.data.object as unknown; // Stripe.Subscription
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = stripeEvent.data.object as unknown; // Stripe.Subscription
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.paid': {
        const invoice = stripeEvent.data.object as unknown; // Stripe.Invoice
        await handleInvoicePaid(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = stripeEvent.data.object as unknown; // Stripe.Invoice
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      case 'charge.refunded': {
        const charge = stripeEvent.data.object as unknown; // Stripe.Charge
        await handleChargeRefunded(charge);
        break;
      }

      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: unknown) { // Stripe.PaymentIntent
  try {
    const intent = paymentIntent as { 
      id: string;
      metadata?: { userId?: string };
      latest_charge?: string | { id?: string };
      amount: number;
      description?: string;
    };
    const userId = intent.metadata?.userId;
    if (!userId) {
      console.error('No userId in payment intent metadata');
      return;
    }

    // Update payment record
    // TODO: Payment model not yet implemented, use Transaction instead
    // Transaction model doesn't have stripePaymentIntentId, use metadata instead
    await prisma.transaction.updateMany({
      where: {
        metadata: {
          path: ['stripePaymentIntentId'],
          equals: intent.id,
        },
      },
      data: {
        status: 'completed',
        metadata: {
          stripePaymentIntentId: intent.id,
          stripeChargeId: typeof intent.latest_charge === 'string' 
            ? intent.latest_charge 
            : intent.latest_charge?.id || null,
          paidAt: new Date().toISOString(),
        },
      },
    });

    // Create transaction record
    await prisma.transaction.create({
      data: {
        userId,
        type: 'payment',
        amount: intent.amount / 100, // Convert from cents
        description: intent.description || 'Payment',
        status: 'completed',
      },
    });

    console.log(`Payment intent succeeded: ${intent.id}`);
  } catch (error: unknown) {
    console.error('Error handling payment intent succeeded:', error);
  }
}

async function handlePaymentIntentFailed(paymentIntent: unknown) { // Stripe.PaymentIntent
  try {
    const intent = paymentIntent as {
      id: string;
      metadata?: { userId?: string };
      last_payment_error?: { message?: string };
    };
    const userId = intent.metadata?.userId;
    if (!userId) return;

    // TODO: Payment model not yet implemented, use Transaction instead
    await prisma.transaction.updateMany({
      where: {
        metadata: {
          path: ['stripePaymentIntentId'],
          equals: intent.id,
        },
      },
      data: {
        status: 'failed',
        metadata: {
          stripePaymentIntentId: intent.id,
          failureReason: intent.last_payment_error?.message || 'Payment failed',
        },
      },
    });

    console.log(`Payment intent failed: ${intent.id}`);
  } catch (error: unknown) {
    console.error('Error handling payment intent failed:', error);
  }
}

async function handleSubscriptionUpdate(subscription: unknown) { // Stripe.Subscription
  try {
    const sub = subscription as {
      id: string;
      metadata?: { userId?: string; tier?: string; billingCycle?: string };
    };
    const userId = sub.metadata?.userId;
    if (!userId) {
      console.error('No userId in subscription metadata');
      return;
    }

    const tier = sub.metadata?.tier || 'basic';
    const billingCycle = sub.metadata?.billingCycle || 'monthly';

    // TODO: Subscription model not yet implemented
    // Subscription functionality disabled until model is implemented

    console.log(`Subscription updated: ${sub.id}`);
  } catch (error: unknown) {
    console.error('Error handling subscription update:', error);
  }
}

async function handleSubscriptionDeleted(subscription: unknown) { // Stripe.Subscription
  try {
    const sub = subscription as { id: string };
    // TODO: Subscription model not yet implemented
    // Subscription functionality disabled until model is implemented

    console.log(`Subscription deleted: ${sub.id}`);
  } catch (error: unknown) {
    console.error('Error handling subscription deleted:', error);
  }
}

async function handleInvoicePaid(invoice: unknown) { // Stripe.Invoice
  try {
    const inv = invoice as {
      id: string;
      subscription?: string | { id?: string };
      invoice_pdf?: string;
      number?: string;
      customer?: string | { id?: string };
    };
    const subscriptionId = typeof inv.subscription === 'string' 
      ? inv.subscription 
      : inv.subscription?.id || null;

    if (subscriptionId) {
      // Update payment record if exists
      // TODO: Payment model not yet implemented, use Transaction instead
    await prisma.transaction.updateMany({
        where: {
          metadata: {
            path: ['stripeInvoiceId'],
            equals: inv.id,
          },
        },
        data: {
          status: 'completed',
          metadata: {
            stripeInvoiceId: inv.id,
            paidAt: new Date().toISOString(),
            invoiceUrl: inv.invoice_pdf || null,
            invoiceNumber: inv.number || null,
          },
        },
      });

      // Create new payment record if doesn't exist
      // TODO: Payment model not yet implemented
      const existingPayment = await prisma.transaction.findFirst({
        where: {
          metadata: {
            path: ['stripeInvoiceId'],
            equals: inv.id,
          },
        },
      });

      if (!existingPayment && inv.customer) {
        const customerId = typeof inv.customer === 'string' 
          ? inv.customer 
          : inv.customer?.id || null;

        if (customerId) {
          // TODO: PaymentMethod model not yet implemented
          const paymentMethod = null;

          if (paymentMethod) {
            // TODO: Subscription and Payment models not yet implemented
            // Subscription payment creation disabled until models are implemented
          }
        }
      }
    }

    console.log(`Invoice paid: ${inv.id}`);
  } catch (error: unknown) {
    console.error('Error handling invoice paid:', error);
  }
}

async function handleInvoicePaymentFailed(invoice: unknown) { // Stripe.Invoice
  try {
    const inv = invoice as {
      id: string;
      subscription?: string | { id?: string };
    };
    // TODO: Payment model not yet implemented, use Transaction instead
    await prisma.transaction.updateMany({
      where: {
        metadata: {
          path: ['stripeInvoiceId'],
          equals: inv.id,
        },
      },
      data: {
        status: 'failed',
        metadata: {
          stripeInvoiceId: inv.id,
          failureReason: 'Invoice payment failed',
        },
      },
    });

    // Update subscription status to past_due
    const subscriptionId = typeof inv.subscription === 'string' 
      ? inv.subscription 
      : inv.subscription?.id || null;

    if (subscriptionId) {
      // TODO: Subscription model not yet implemented
      // Subscription status update disabled until model is implemented
    }

    console.log(`Invoice payment failed: ${inv.id}`);
  } catch (error: unknown) {
    console.error('Error handling invoice payment failed:', error);
  }
}

async function handleChargeRefunded(charge: unknown) { // Stripe.Charge
  try {
    const ch = charge as {
      id: string;
      amount_refunded: number;
    };
    // TODO: Payment model not yet implemented
    const payment = await prisma.transaction.findFirst({
      where: {
        metadata: {
          path: ['stripeChargeId'],
          equals: ch.id,
        },
      },
    });

    if (payment) {
      const refundAmount = ch.amount_refunded / 100; // Convert from cents
      const paymentMetadata = payment.metadata as Record<string, unknown> | null;

      // TODO: Payment model not yet implemented
      await prisma.transaction.update({
        where: { id: payment.id },
        data: {
          status: refundAmount >= Math.abs(payment.amount) ? 'refunded' : 'partially_refunded',
          metadata: {
            ...(paymentMetadata || {}),
            refundAmount,
            refundedAt: new Date().toISOString(),
          },
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

    console.log(`Charge refunded: ${ch.id}`);
  } catch (error: unknown) {
    console.error('Error handling charge refunded:', error);
  }
}

