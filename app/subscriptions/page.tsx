'use client';

import { useState } from 'react';
import { useAccount } from '@/hooks/useAccount';
import { motion } from 'framer-motion';
import PageTransition from '@/components/ui/PageTransition';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';
import { CheckCircle, Zap, Crown, Rocket } from 'lucide-react';

export default function SubscriptionsPage() {
  const { address } = useAccount();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const tiers = [
    {
      id: 'free',
      name: 'Explorer',
      price: 0,
      features: [
        '5 meals/week tracking',
        '50 basic recipes',
        'Community (view only)',
        '1x $TA earning rate',
      ],
      icon: Rocket
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 24.99,
      priceYearly: 199,
      features: [
        'Unlimited tracking',
        '2,000+ recipes with videos',
        'AI nutrition coach',
        'Disease-specific plans',
        '2x $TA rewards',
        'Priority support',
        'Monthly NFT drop',
      ],
      icon: Zap
    },
    {
      id: 'elite',
      name: 'Elite',
      price: 79.99,
      priceYearly: 799,
      features: [
        'Everything in Premium',
        'Monthly 30-min 1-on-1 with Chef Adrian',
        'Custom meal plans',
        'Private event invitations',
        'Quarterly cookbook delivery',
        'VIP NFT collection',
        '5x $TA rewards',
        'Concierge support',
      ],
      icon: Crown
    },
  ];

  const subscribe = async (tierId: string, billing: 'monthly' | 'yearly') => {
    if (!address) {
      alert('Please connect your wallet');
      return;
    }
    // Mock subscription logic
    alert(`Subscribing to ${tierId} (${billing})... (Mock)`);
  };

  return (
    <PageTransition>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-crypto-gradient text-transparent bg-clip-text mb-4">
              Choose Your Plan
            </h1>
            <p className="text-lg text-text-secondary">
              Unlock the full potential of your wellness journey.
            </p>
            <div className="mt-6 flex justify-center">
              <div className="glass-card p-1 flex gap-2 rounded-lg">
                <AnimatedButton
                  size="sm"
                  variant={billingCycle === 'monthly' ? 'primary' : 'ghost'}
                  onClick={() => setBillingCycle('monthly')}
                >
                  Monthly
                </AnimatedButton>
                <AnimatedButton
                  size="sm"
                  variant={billingCycle === 'yearly' ? 'primary' : 'ghost'}
                  onClick={() => setBillingCycle('yearly')}
                >
                  Yearly (Save 20%)
                </AnimatedButton>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {tiers.map((tier) => {
              const Icon = tier.icon;
              return (
                <motion.div
                  key={tier.id}
                  variants={fadeInUp}
                  className={`glass-card-hover p-6 flex flex-col ${tier.id === 'premium' ? 'ring-2 ring-accent-primary shadow-glow' : ''}`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Icon className="w-8 h-8 text-accent-primary" />
                    <h3 className="text-2xl font-bold text-text-primary">
                      {tier.name}
                    </h3>
                  </div>
                  <div className="mb-6">
                    {tier.price > 0 ? (
                      <>
                        <p className="text-4xl font-bold text-text-primary">
                          ${billingCycle === 'yearly' ? (tier.priceYearly ? tier.priceYearly / 12 : tier.price).toFixed(0) : tier.price}
                          <span className="text-lg text-text-secondary">/mo</span>
                        </p>
                        {tier.priceYearly && (
                          <p className="text-xs text-text-secondary mt-1">
                            Billed as ${tier.priceYearly}/year
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-4xl font-bold text-text-primary">Free</p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-sm">
                        <CheckCircle className="w-5 h-5 text-semantic-success mr-2 flex-shrink-0" />
                        <span className="text-text-secondary">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {tier.price > 0 ? (
                    <AnimatedButton
                      onClick={() => subscribe(tier.id, billingCycle)}
                      variant={tier.id === 'premium' ? 'primary' : 'secondary'}
                      className="w-full mt-auto"
                    >
                      Subscribe
                    </AnimatedButton>
                  ) : (
                    <AnimatedButton variant="secondary" className="w-full mt-auto" disabled>
                      Current Plan
                    </AnimatedButton>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}

