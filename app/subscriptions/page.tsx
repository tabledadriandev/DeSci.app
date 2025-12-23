'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';

export default function SubscriptionsPage() {
  const { address } = useAccount();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  const tiers = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      features: [
        '5 meals/week tracking',
        '50 basic recipes',
        'Community (view only)',
        '1x $tabledadrian earning rate',
      ],
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
        '2x $tabledadrian rewards',
        'Priority support',
        'Monthly NFT drop',
      ],
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
        '5x $tabledadrian rewards',
        'Concierge support',
      ],
    },
    {
      id: 'mastermind',
      name: 'Mastermind',
      price: 299,
      priceYearly: 2999,
      features: [
        'Everything in Elite',
        'Weekly 1-on-1 sessions',
        'Personalized culinary training',
        '20% discount on chef services',
        'Annual exclusive retreat',
        'Custom longevity protocol',
        'Lifetime exclusive NFTs',
        '10x $tabledadrian rewards',
        'Direct messaging with Chef Adrian',
        '10% commission on referrals',
      ],
    },
  ];

  const subscribe = async (tierId: string, billing: 'monthly' | 'yearly') => {
    if (!address) {
      alert('Please connect your wallet');
      return;
    }

    const tier = tiers.find((t) => t.id === tierId);
    if (!tier) return;

    const price = billing === 'yearly' ? tier.priceYearly : tier.price;

    try {
      const response = await fetch('/api/subscriptions/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          tierId,
          billing,
          price,
        }),
      });

      if (response.ok) {
        alert('Subscription successful!');
      } else {
        const error = await response.json();
        alert(error.error || 'Subscription failed');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      alert('Subscription failed');
    }
  };

  return (
    <div className="min-h-screen  p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-display text-accent-primary mb-8 text-center">
          Choose Your Plan
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`bg-white rounded-xl shadow-md p-6 ${
                tier.id === 'premium' ? 'ring-2 ring-accent-primary' : ''
              }`}
            >
              <h3 className="text-2xl font-display text-text-primary mb-2">
                {tier.name}
              </h3>
              <div className="mb-4">
                {tier.price > 0 ? (
                  <>
                    <div className="text-3xl font-display text-accent-primary">
                      ${tier.price}
                      <span className="text-lg text-text-secondary">/mo</span>
                    </div>
                    {tier.priceYearly && (
                      <div className="text-sm text-text-secondary mt-1">
                        or ${tier.priceYearly}/year (save{' '}
                        {Math.round(((tier.price * 12 - tier.priceYearly) / (tier.price * 12)) * 100)}%)
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-3xl font-display text-accent-primary">
                    Free
                  </div>
                )}
              </div>

              <ul className="space-y-2 mb-6">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start text-sm">
                    <span className="text-green-600 mr-2">✓</span>
                    <span className="text-text-secondary">{feature}</span>
                  </li>
                ))}
              </ul>

              {tier.price > 0 && (
                <div className="space-y-2">
                  <button
                    onClick={() => subscribe(tier.id, 'monthly')}
                    className="w-full bg-accent-primary text-white px-4 py-2 rounded-lg hover:bg-accent-primary/90 transition-colors"
                  >
                    Subscribe Monthly
                  </button>
                  {tier.priceYearly && (
                    <button
                      onClick={() => subscribe(tier.id, 'yearly')}
                      className="w-full border-2 border-accent-primary text-accent-primary px-4 py-2 rounded-lg hover:bg-accent-primary/10 transition-colors"
                    >
                      Subscribe Yearly
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

