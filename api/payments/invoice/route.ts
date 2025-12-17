import { NextRequest, NextResponse } from 'next/server';
import { stripeService } from '@/lib/stripe';
import { authService } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/payments/invoice?paymentId=xxx
 * Get invoice PDF URL or generate invoice data
 */
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');
    const subscriptionId = searchParams.get('subscriptionId');

    if (!paymentId && !subscriptionId) {
      return NextResponse.json(
        { error: 'Payment ID or Subscription ID is required' },
        { status: 400 }
      );
    }

    // Get invoice for payment
    if (paymentId) {
      const payment = await prisma.payment.findFirst({
        where: {
          id: paymentId,
          userId: user.id,
        },
      });

      if (!payment) {
        return NextResponse.json(
          { error: 'Payment not found' },
          { status: 404 }
        );
      }

      // For Stripe payments, get invoice PDF
      if (payment.stripeInvoiceId) {
        const invoiceUrl = await stripeService.getInvoicePdfUrl(payment.stripeInvoiceId);
        
        return NextResponse.json({
          success: true,
          invoice: {
            paymentId: payment.id,
            amount: payment.amount,
            currency: payment.currency,
            description: payment.description,
            paidAt: payment.paidAt,
            invoiceUrl: invoiceUrl || payment.invoiceUrl,
            invoiceNumber: payment.invoiceNumber,
          },
        });
      }

      // For crypto payments, generate invoice data (no PDF)
      return NextResponse.json({
        success: true,
        invoice: {
          paymentId: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          description: payment.description,
          paidAt: payment.paidAt,
          txHash: payment.txHash,
          invoiceNumber: `INV-${payment.id.slice(0, 8).toUpperCase()}`,
        },
      });
    }

    // Get invoices for subscription
    if (subscriptionId) {
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

      // Get all payments for this subscription
      const payments = await prisma.payment.findMany({
        where: {
          subscriptionId: subscription.id,
          status: 'succeeded',
        },
        orderBy: {
          paidAt: 'desc',
        },
      });

      const invoices = await Promise.all(
        payments.map(async (payment: any) => {
          let invoiceUrl = payment.invoiceUrl;
          
          if (payment.stripeInvoiceId && !invoiceUrl) {
            invoiceUrl = await stripeService.getInvoicePdfUrl(payment.stripeInvoiceId) || null;
          }

          return {
            paymentId: payment.id,
            amount: payment.amount,
            currency: payment.currency,
            description: payment.description,
            paidAt: payment.paidAt,
            invoiceUrl,
            invoiceNumber: payment.invoiceNumber || `INV-${payment.id.slice(0, 8).toUpperCase()}`,
          };
        })
      );

      return NextResponse.json({
        success: true,
        subscription: {
          id: subscription.id,
          tier: subscription.tier,
          billingCycle: subscription.billingCycle,
        },
        invoices,
      });
    }

    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}

