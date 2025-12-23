'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

type SupplementItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string | null;
  category: string;
  type: string;
  stock?: number | null;
};

const GOALS = ['longevity', 'sleep', 'metabolic', 'gut-health', 'performance'] as const;
type Goal = (typeof GOALS)[number];

export default function SupplementsPage() {
  const { address } = useAccount();
  const [goal, setGoal] = useState<Goal>('longevity');
  const [items, setItems] = useState<SupplementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  useEffect(() => {
    void loadSupplements(goal);
  }, [goal]);

  const loadSupplements = async (selectedGoal: Goal) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ goal: selectedGoal });
      const res = await fetch(`/api/marketplace/supplements/recommend?${params.toString()}`);
      if (!res.ok) return;
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error('Error loading supplements', err);
    } finally {
      setLoading(false);
    }
  };

  const purchase = async (itemId: string) => {
    if (!address) {
      alert('Please connect your wallet');
      return;
    }
    setPurchasingId(itemId);
    try {
      const res = await fetch('/api/marketplace/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, itemId }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Purchase failed');
      } else {
        alert(data.message || 'Purchase initiated');
      }
    } catch (err) {
      console.error('Error purchasing supplement', err);
      alert('Purchase failed');
    } finally {
      setPurchasingId(null);
    }
  };

  return (
    <div className="min-h-screen  p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display text-accent-primary">
              Supplements Marketplace
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-2xl">
              Evidence-informed supplements curated for Table d&apos;Adrian protocols. Filter
              by goal to see what best supports your current phase.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
          {GOALS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGoal(g)}
              className={`px-4 py-2 rounded-full border ${
                goal === g
                  ? 'bg-accent-primary text-white border-accent-primary'
                  : 'bg-white border-border-light text-text-secondary hover:bg-gray-50'
              }`}
            >
              {g.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-text-secondary text-sm">Loading…</div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <div className="text-6xl mb-4">💊</div>
            <h2 className="text-2xl font-display mb-2">No supplements listed yet</h2>
            <p className="text-text-secondary text-sm max-w-md mx-auto">
              As we onboard partner brands and finalize protocols, recommended supplements will
              start to appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col"
              >
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-5 flex flex-col gap-3 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base sm:text-lg font-display text-text-primary">
                      {item.name}
                    </h3>
                    <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px]">
                      {goal.replace('-', ' ')}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-text-secondary line-clamp-4">
                    {item.description}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-1">
                    <div className="text-lg font-display text-accent-primary">
                      {item.price} $tabledadrian
                    </div>
                    <button
                      type="button"
                      onClick={() => purchase(item.id)}
                      disabled={!address || purchasingId === item.id}
                      className="bg-accent-primary text-white px-4 py-2 rounded-lg text-xs sm:text-sm hover:bg-accent-primary/90 transition-colors disabled:opacity-60"
                    >
                      {purchasingId === item.id ? 'Purchasing…' : 'Buy'}
                    </button>
                  </div>
                  {item.stock != null && (
                    <div className="text-[11px] text-text-secondary">
                      {item.stock} in stock
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


