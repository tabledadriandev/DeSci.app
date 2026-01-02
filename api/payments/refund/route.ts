import { NextRequest, NextResponse } from 'next/server';
import { stripeService } from '@/lib/stripe';
import { authService } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * POST /api/payments/refund
 * Request refund for a payment (14-day money-back guarantee for fiat)
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

    const { paymentId, reason, amount } = await request.json();

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }

      // TODO: Payment model not yet implemented, use Transaction instead
      const payment = await prisma.transaction.findFirst({
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

    // TODO: Transaction model doesn't have paymentMethod, check metadata instead
    const paymentMetadata = payment.metadata as Record<string, unknown> | null;
    const paymentMethod = (paymentMetadata?.paymentMethod as string) || payment.type;
    
    // Check if payment is eligible for refund (14 days for fiat, no refunds for crypto)
    if (paymentMethod === 'crypto' || payment.txHash) {
      return NextResponse.json(
        { error: 'Crypto payments are non-refundable' },
        { status: 400 }
      );
    }

    // Check if payment was made within last 14 days
    const daysSincePayment = Math.floor(
      (Date.now() - payment.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSincePayment > 14) {
      return NextResponse.json(
        { error: 'Refund period expired. Refunds are only available within 14 days of payment.' },
        { status: 400 }
      );
    }

    // Check if already refunded
    if (payment.status === 'refunded' || payment.status === 'partially_refunded') {
      return NextResponse.json(
        { error: 'Payment has already been refunded' },
        { status: 400 }
      );
    }

    // Check if payment was successful
    if (payment.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Only successful payments can be refunded' },
        { status: 400 }
      );
    }

    // TODO: Transaction model doesn't have stripeChargeId, check metadata instead
    const stripeChargeId = (paymentMetadata?.stripeChargeId as string) || null;
    if (stripeChargeId) {
      const refundAmount = amount ? amount * 100 : undefined; // Convert to cents if partial refund
      const refund = await stripeService.createRefund(
        stripeChargeId,
        refundAmount,
        reason || 'requested_by_customer'
      );

      // Update transaction record
      const finalRefundAmount = ((refund.amount as number) || 0) / 100; // Convert from cents
      const isFullRefund = finalRefundAmount >= Math.abs(payment.amount);

      await prisma.transaction.update({
        where: { id: payment.id },
        data: {
          status: isFullRefund ? 'refunded' : 'partially_refunded',
          metadata: {
            ...(paymentMetadata || {}),
            refundAmount: finalRefundAmount,
            refundedAt: new Date().toISOString(),
            refundReason: reason || 'requested_by_customer',
          },
        },
      });

      // Create refund transaction
      await prisma.transaction.create({
        data: {
          userId: user.id,
          type: 'refund',
          amount: -finalRefundAmount, // Negative for refund
          description: `Refund for ${payment.description}`,
          status: 'completed',
        },
      });

      return NextResponse.json({
        success: true,
        refund: {
          id: refund.id,
          amount: finalRefundAmount,
          status: refund.status,
          reason: refund.reason,
        },
        message: isFullRefund 
          ? 'Full refund processed successfully' 
          : `Partial refund of ${finalRefundAmount} processed successfully`,
      });
    }

    return NextResponse.json(
      { error: 'Refund not available for this payment method' },
      { status: 400 }
    );
  } catch (error: unknown) {
    console.error('Error processing refund:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to process refund';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

