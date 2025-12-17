/**
 * Stripe Payment Service
 * Handles all Stripe payment operations including customers, payment intents, subscriptions, and webhooks
 */

import Stripe from 'stripe';
import { prisma } from './prisma';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  // Use a stable, supported Stripe API version for typed client
  apiVersion: '2023-10-16',
  typescript: true,
});

export const stripeConfig = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  secretKey: process.env.STRIPE_SECRET_KEY || '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
};

// Pricing tiers (in cents for Stripe)
export const PRICING_TIERS = {
  basic: {
    monthly: { fiat: 2900, crypto: 50 }, // $29/month or 50 TA/month
    yearly: { fiat: 29000, crypto: 500 }, // $290/year or 500 TA/year
  },
  premium: {
    monthly: { fiat: 19900, crypto: 500 }, // $199/month or 500 TA/month
    yearly: { fiat: 199000, crypto: 5000 }, // $1990/year or 5000 TA/year
  },
  concierge: {
    monthly: { fiat: 79900, crypto: 2000 }, // $799/month or 2000 TA/month
    yearly: { fiat: 799000, crypto: 20000 }, // $7990/year or 20000 TA/year
  },
} as const;

export type SubscriptionTier = 'basic' | 'premium' | 'concierge';
export type BillingCycle = 'monthly' | 'yearly';
export type PaymentMethodType = 'crypto' | 'fiat';

export class StripeService {
  /**
   * Create or retrieve Stripe customer
   */
  async getOrCreateCustomer(userId: string, email?: string, name?: string): Promise<string> {
    try {
      // Check if user already has a Stripe customer ID
      const paymentMethod = await prisma.paymentMethod.findFirst({
        where: {
          userId,
          stripeCustomerId: { not: null },
        },
      });

      if (paymentMethod?.stripeCustomerId) {
        return paymentMethod.stripeCustomerId;
      }

      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: email || undefined,
        name: name || undefined,
        metadata: {
          userId,
        },
      });

      // Create or update payment method record
      await prisma.paymentMethod.upsert({
        where: {
          id: paymentMethod?.id || `temp-${userId}`,
        },
        create: {
          id: `pm-${userId}-${Date.now()}`,
          userId,
          type: 'stripe_card',
          provider: 'stripe',
          stripeCustomerId: customer.id,
          isActive: true,
        },
        update: {
          stripeCustomerId: customer.id,
        },
      });

      return customer.id;
    } catch (error: any) {
      console.error('Error creating Stripe customer:', error);
      throw new Error(`Failed to create Stripe customer: ${error.message}`);
    }
  }

  /**
   * Create payment intent for one-time payment
   */
  async createPaymentIntent(
    userId: string,
    amount: number, // Amount in cents (fiat) or smallest unit (crypto)
    currency: string, // 'usd', 'eur', 'gbp', or 'ta'
    description: string,
    metadata?: Record<string, string>
  ): Promise<Stripe.PaymentIntent> {
    try {
      const customerId = await this.getOrCreateCustomer(userId);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount),
        currency: currency.toLowerCase(),
        customer: customerId,
        description,
        metadata: {
          userId,
          ...metadata,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return paymentIntent;
    } catch (error: any) {
      console.error('Error creating payment intent:', error);
      throw new Error(`Failed to create payment intent: ${error.message}`);
    }
  }

  /**
   * Create subscription
   */
  async createSubscription(
    userId: string,
    tier: SubscriptionTier,
    billingCycle: BillingCycle,
    paymentMethodId?: string
  ): Promise<Stripe.Subscription> {
    try {
      const customerId = await this.getOrCreateCustomer(userId);
      
      // Get price ID from Stripe (you'll need to create these in Stripe dashboard)
      // For now, we'll use the price calculation
      const priceInCents = PRICING_TIERS[tier][billingCycle].fiat;
      
      // Create price if it doesn't exist (or use existing price ID from env)
      const priceId = process.env[`STRIPE_PRICE_ID_${tier.toUpperCase()}_${billingCycle.toUpperCase()}`] || null;

      if (!priceId) {
        // Create price on the fly (not ideal for production, but works for now)
        const price = await stripe.prices.create({
          currency: 'usd',
          unit_amount: priceInCents,
          recurring: {
            interval: billingCycle === 'monthly' ? 'month' : 'year',
          },
          product_data: {
            name: `${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan - ${billingCycle}`,
            metadata: {
              tier,
              billingCycle,
            },
          },
        });

        const subscription = await stripe.subscriptions.create({
          customer: customerId,
          items: [{ price: price.id }],
          payment_behavior: 'default_incomplete',
          payment_settings: {
            payment_method_types: ['card'],
            save_default_payment_method: 'on_subscription',
          },
          expand: ['latest_invoice.payment_intent'],
          metadata: {
            userId,
            tier,
            billingCycle,
          },
        });

        return subscription;
      } else {
        // Use existing price ID
        const subscription = await stripe.subscriptions.create({
          customer: customerId,
          items: [{ price: priceId }],
          payment_behavior: 'default_incomplete',
          payment_settings: {
            payment_method_types: ['card'],
            save_default_payment_method: 'on_subscription',
          },
          expand: ['latest_invoice.payment_intent'],
          metadata: {
            userId,
            tier,
            billingCycle,
          },
        });

        return subscription;
      }
    } catch (error: any) {
      console.error('Error creating subscription:', error);
      throw new Error(`Failed to create subscription: ${error.message}`);
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd: boolean = true
  ): Promise<Stripe.Subscription> {
    try {
      if (cancelAtPeriodEnd) {
        const subscription = await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });
        return subscription;
      } else {
        const subscription = await stripe.subscriptions.cancel(subscriptionId);
        return subscription;
      }
    } catch (error: any) {
      console.error('Error canceling subscription:', error);
      throw new Error(`Failed to cancel subscription: ${error.message}`);
    }
  }

  /**
   * Update subscription (change tier or billing cycle)
   */
  async updateSubscription(
    subscriptionId: string,
    newTier?: SubscriptionTier,
    newBillingCycle?: BillingCycle
  ): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      if (newTier && newBillingCycle) {
        const priceInCents = PRICING_TIERS[newTier][newBillingCycle].fiat;
        const priceId = process.env[`STRIPE_PRICE_ID_${newTier.toUpperCase()}_${newBillingCycle.toUpperCase()}`];
        
        if (priceId) {
          const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
            items: [{
              id: subscription.items.data[0].id,
              price: priceId,
            }],
            proration_behavior: 'create_prorations',
            metadata: {
              ...subscription.metadata,
              tier: newTier,
              billingCycle: newBillingCycle,
            },
          });
          
          return updatedSubscription;
        }
      }

      throw new Error('Price ID not found for new tier/billing cycle');
    } catch (error: any) {
      console.error('Error updating subscription:', error);
      throw new Error(`Failed to update subscription: ${error.message}`);
    }
  }

  /**
   * Create refund
   */
  async createRefund(
    chargeId: string,
    amount?: number,
    reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
  ): Promise<Stripe.Refund> {
    try {
      const refund = await stripe.refunds.create({
        charge: chargeId,
        amount: amount ? Math.round(amount) : undefined,
        reason: reason || 'requested_by_customer',
      });

      return refund;
    } catch (error: any) {
      console.error('Error creating refund:', error);
      throw new Error(`Failed to create refund: ${error.message}`);
    }
  }

  /**
   * Retrieve payment intent
   */
  async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error: any) {
      console.error('Error retrieving payment intent:', error);
      throw new Error(`Failed to retrieve payment intent: ${error.message}`);
    }
  }

  /**
   * Retrieve subscription
   */
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      return subscription;
    } catch (error: any) {
      console.error('Error retrieving subscription:', error);
      throw new Error(`Failed to retrieve subscription: ${error.message}`);
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(
    payload: string | Buffer,
    signature: string
  ): Stripe.Event {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        stripeConfig.webhookSecret
      );
      return event;
    } catch (error: any) {
      console.error('Webhook signature verification failed:', error);
      throw new Error(`Webhook signature verification failed: ${error.message}`);
    }
  }

  /**
   * Create invoice PDF
   */
  async getInvoicePdfUrl(invoiceId: string): Promise<string | null> {
    try {
      const invoice = await stripe.invoices.retrieve(invoiceId);
      return invoice.invoice_pdf || null;
    } catch (error: any) {
      console.error('Error retrieving invoice PDF:', error);
      return null;
    }
  }

  /**
   * List payment methods for customer
   */
  async listPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });
      return paymentMethods.data;
    } catch (error: any) {
      console.error('Error listing payment methods:', error);
      throw new Error(`Failed to list payment methods: ${error.message}`);
    }
  }

  /**
   * Attach payment method to customer
   */
  async attachPaymentMethod(
    paymentMethodId: string,
    customerId: string
  ): Promise<Stripe.PaymentMethod> {
    try {
      const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
      return paymentMethod;
    } catch (error: any) {
      console.error('Error attaching payment method:', error);
      throw new Error(`Failed to attach payment method: ${error.message}`);
    }
  }

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(
    customerId: string,
    paymentMethodId: string
  ): Promise<Stripe.Customer> {
    try {
      const customer = await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
      return customer;
    } catch (error: any) {
      console.error('Error setting default payment method:', error);
      throw new Error(`Failed to set default payment method: ${error.message}`);
    }
  }
}

export const stripeService = new StripeService();

