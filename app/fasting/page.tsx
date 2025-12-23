'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

export default function FastingTrackerPage() {
  const { address } = useAccount();
  const [fastingStart, setFastingStart] = useState<Date | null>(null);
  const [fastingType, setFastingType] = useState('16:8');
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (fastingStart) {
      const interval = setInterval(() => {
        const now = new Date();
        const diff = now.getTime() - fastingStart.getTime();
        setElapsed(Math.floor(diff / 1000 / 60)); // minutes
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [fastingStart]);

  const startFast = async () => {
    if (!address) return;

    const startTime = new Date();
    setFastingStart(startTime);

    try {
      await fetch('/api/fasting/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          type: fastingType,
          startTime: startTime.toISOString(),
        }),
      });
    } catch (error) {
      console.error('Error starting fast:', error);
    }
  };

  const endFast = async () => {
    if (!address || !fastingStart) return;

    try {
      await fetch('/api/fasting/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          endTime: new Date().toISOString(),
        }),
      });

      setFastingStart(null);
      setElapsed(0);
    } catch (error) {
      console.error('Error ending fast:', error);
    }
  };

  const hours = Math.floor(elapsed / 60);
  const minutes = elapsed % 60;

  return (
    <div className="min-h-screen  p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-display text-accent-primary mb-8">
          Intermittent Fasting Tracker
        </h1>

        <div className="bg-white rounded-xl shadow-md p-8 text-center mb-8">
          {fastingStart ? (
            <>
              <div className="text-6xl font-display text-accent-primary mb-4">
                {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}
              </div>
              <p className="text-text-secondary mb-6">Fasting in progress</p>
              <button
                onClick={endFast}
                className="bg-red-500 text-white px-8 py-3 rounded-lg hover:bg-red-600 transition-colors"
              >
                End Fast
              </button>
            </>
          ) : (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Fasting Protocol
                </label>
                <select
                  value={fastingType}
                  onChange={(e) => setFastingType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="16:8">16:8 (16 hours fast, 8 hours eat)</option>
                  <option value="18:6">18:6 (18 hours fast, 6 hours eat)</option>
                  <option value="20:4">20:4 (20 hours fast, 4 hours eat)</option>
                  <option value="OMAD">OMAD (One Meal A Day)</option>
                  <option value="24:0">24 Hour Fast</option>
                  <option value="36:0">36 Hour Fast</option>
                </select>
              </div>
              <button
                onClick={startFast}
                className="bg-accent-primary text-white px-8 py-3 rounded-lg hover:bg-accent-primary/90 transition-colors"
              >
                Start Fast
              </button>
            </>
          )}
        </div>

        {/* Circadian Rhythm Info */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-display mb-4">Circadian Rhythm Optimization</h2>
          <p className="text-text-secondary mb-4">
            Align your eating window with your body's natural circadian rhythm for optimal health benefits.
          </p>
          <div className="space-y-2">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="font-semibold">🌅 Morning (6 AM - 12 PM)</div>
              <div className="text-sm text-text-secondary">
                Best time to break fast for metabolic benefits
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="font-semibold">☀️ Afternoon (12 PM - 6 PM)</div>
              <div className="text-sm text-text-secondary">
                Optimal eating window for most people
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="font-semibold">🌙 Evening (6 PM - 10 PM)</div>
              <div className="text-sm text-text-secondary">
                Avoid eating late to support circadian rhythm
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

