/**
 * Stripe Payment Service
 * Handles all Stripe payment operations including customers, payment intents, subscriptions, and webhooks
 */

import { prisma } from './prisma';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Stripe: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let stripe: any = null;

// Try to load Stripe (optional dependency)
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Stripe = require('stripe');
  
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('STRIPE_SECRET_KEY not set - Stripe integration disabled');
  } else {
    if (Stripe) {
      stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        // Use a stable, supported Stripe API version for typed client
        apiVersion: '2023-10-16',
        typescript: true,
      });
    }
  }
} catch {
  // Stripe not installed - Stripe operations will be disabled
  console.warn('stripe package not installed - Stripe integration disabled');
}

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
    if (!stripe) {
      throw new Error('Stripe not initialized - STRIPE_SECRET_KEY required');
    }

    if (!stripe) {
      throw new Error('Stripe is not initialized');
    }

    try {
      // TODO: PaymentMethod model not yet implemented
      // For now, always create a new Stripe customer (Stripe will handle duplicates)
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: email || undefined,
        name: name || undefined,
        metadata: {
          userId,
        },
      });

      // TODO: Store stripeCustomerId in Transaction metadata when PaymentMethod model is added
      // await prisma.paymentMethod.upsert({...});

      return customer.id;
    } catch (error: unknown) {
      console.error('Error creating Stripe customer:', error);
      throw new Error(`Failed to create Stripe customer: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
  ): Promise<any> {
    if (!stripe) {
      throw new Error('Stripe is not initialized');
    }

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
    } catch (error) {
      console.error('Error creating payment intent:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to create payment intent: ${errorMessage}`);
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
  ): Promise<any> {
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
    } catch (error) {
      console.error('Error creating subscription:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to create subscription: ${errorMessage}`);
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd: boolean = true
  ): Promise<any> {
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
    } catch (error) {
      console.error('Error canceling subscription:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to cancel subscription: ${errorMessage}`);
    }
  }

  /**
   * Update subscription (change tier or billing cycle)
   */
  async updateSubscription(
    subscriptionId: string,
    newTier?: SubscriptionTier,
    newBillingCycle?: BillingCycle
  ): Promise<any> {
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
    } catch (error) {
      console.error('Error updating subscription:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to update subscription: ${errorMessage}`);
    }
  }

  /**
   * Create refund
   */
  async createRefund(
    chargeId: string,
    amount?: number,
    reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
  ): Promise<any> {
    try {
      const refund = await stripe.refunds.create({
        charge: chargeId,
        amount: amount ? Math.round(amount) : undefined,
        reason: reason || 'requested_by_customer',
      });

      return refund;
    } catch (error) {
      console.error('Error creating refund:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to create refund: ${errorMessage}`);
    }
  }

  /**
   * Retrieve payment intent
   */
  async getPaymentIntent(paymentIntentId: string): Promise<any> {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error('Error retrieving payment intent:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to retrieve payment intent: ${errorMessage}`);
    }
  }

  /**
   * Retrieve subscription
   */
  async getSubscription(subscriptionId: string): Promise<any> {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      return subscription;
    } catch (error) {
      console.error('Error retrieving subscription:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to retrieve subscription: ${errorMessage}`);
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(
    payload: string | Buffer,
    signature: string
  ): Record<string, unknown> | null {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        stripeConfig.webhookSecret
      );
      return event;
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Webhook signature verification failed: ${errorMessage}`);
    }
  }

  /**
   * Create invoice PDF
   */
  async getInvoicePdfUrl(invoiceId: string): Promise<string | null> {
    try {
      const invoice = await stripe.invoices.retrieve(invoiceId);
      return invoice.invoice_pdf || null;
    } catch (error) {
      console.error('Error retrieving invoice PDF:', error);
      return null;
    }
  }

  /**
   * List payment methods for customer
   */
  async listPaymentMethods(customerId: string): Promise<any[]> {
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });
      return paymentMethods.data;
    } catch (error) {
      console.error('Error listing payment methods:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to list payment methods: ${errorMessage}`);
    }
  }

  /**
   * Attach payment method to customer
   */
  async attachPaymentMethod(
    paymentMethodId: string,
    customerId: string
  ): Promise<any> {
    try {
      const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
      return paymentMethod;
    } catch (error) {
      console.error('Error attaching payment method:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to attach payment method: ${errorMessage}`);
    }
  }

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(
    customerId: string,
    paymentMethodId: string
  ): Promise<any> {
    try {
      const customer = await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
      return customer;
    } catch (error) {
      console.error('Error setting default payment method:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to set default payment method: ${errorMessage}`);
    }
  }
}

export const stripeService = new StripeService();

