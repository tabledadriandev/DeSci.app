'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

export default function BattlePassPage() {
  const { address } = useAccount();
  const [progress, setProgress] = useState(0);
  const [tier, setTier] = useState(0);

  const tiers = [
    { level: 1, reward: '10 $tabledadrian', xp: 100 },
    { level: 2, reward: 'Recipe NFT', xp: 200 },
    { level: 3, reward: '25 $tabledadrian', xp: 300 },
    { level: 4, reward: 'Exclusive Badge', xp: 400 },
    { level: 5, reward: '50 $tabledadrian', xp: 500 },
    { level: 6, reward: 'VIP Access NFT', xp: 600 },
    { level: 7, reward: '100 $tabledadrian', xp: 700 },
    { level: 8, reward: 'Chef Consultation (15min)', xp: 800 },
    { level: 9, reward: '200 $tabledadrian', xp: 900 },
    { level: 10, reward: 'Legendary Achievement NFT', xp: 1000 },
  ];

  useEffect(() => {
    if (address) {
      loadProgress();
    }
  }, [address]);

  const loadProgress = async () => {
    try {
      const response = await fetch(`/api/battle-pass/progress?address=${address}`);
      const data = await response.json();
      setProgress(data.progress || 0);
      setTier(data.tier || 0);
    } catch (error) {
      console.error('Error loading battle pass progress:', error);
    }
  };

  return (
    <div className="min-h-screen  p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-display text-accent-primary mb-8">
          Seasonal Battle Pass
        </h1>

        {/* Progress Bar */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-display mb-2">Current Tier: {tier}</h2>
              <p className="text-text-secondary">
                {progress} / {tiers[tier]?.xp || 1000} XP
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-text-secondary">Next Reward</div>
              <div className="text-lg font-semibold text-accent-primary">
                {tiers[tier]?.reward || 'Complete!'}
              </div>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
            <div
              className="bg-gradient-to-r from-accent-primary to-yellow-400 h-4 rounded-full transition-all"
              style={{
                width: `${Math.min(100, (progress / (tiers[tier]?.xp || 1000)) * 100)}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Tiers */}
        <div className="space-y-4">
          {tiers.map((tierData, index) => {
            const isUnlocked = index <= tier;
            const isCurrent = index === tier;

            return (
              <div
                key={tierData.level}
                className={`bg-white rounded-xl shadow-md p-6 ${
                  isCurrent ? 'ring-2 ring-accent-primary' : ''
                } ${isUnlocked ? 'opacity-100' : 'opacity-50'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                        isUnlocked
                          ? 'bg-accent-primary text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {isUnlocked ? '✓' : tierData.level}
                    </div>
                    <div>
                      <div className="font-semibold text-text-primary">
                        Tier {tierData.level}
                      </div>
                      <div className="text-sm text-text-secondary">
                        {tierData.xp} XP required
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-accent-primary">
                      {tierData.reward}
                    </div>
                    {isUnlocked && !isCurrent && (
                      <div className="text-sm text-green-600">✓ Claimed</div>
                    )}
                    {isCurrent && (
                      <div className="text-sm text-accent-primary">In Progress</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

