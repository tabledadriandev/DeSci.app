'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { prisma } from '@/lib/prisma';

export default function HealthTrackingPage() {
  const { address } = useAccount();
  const [healthData, setHealthData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    type: 'steps',
    value: '',
    unit: '',
    notes: '',
    source: 'manual',
  });

  useEffect(() => {
    if (address) {
      loadHealthData();
    }
  }, [address]);

  const loadHealthData = async () => {
    try {
      const response = await fetch(`/api/health?address=${address}`);
      const data = await response.json();
      setHealthData(data);
    } catch (error) {
      console.error('Error loading health data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    try {
      const response = await fetch('/api/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          ...formData,
          value: parseFloat(formData.value),
        }),
      });

      if (response.ok) {
        await loadHealthData();
        setFormData({ type: 'steps', value: '', unit: '', notes: '', source: 'manual' });
        // Award $tabledadrian reward
        await fetch('/api/rewards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address,
            type: 'health_tracked',
            amount: 1, // 1 TA token
          }),
        });
      }
    } catch (error) {
      console.error('Error submitting health data:', error);
    }
  };

  const healthTypes = [
    { value: 'steps', label: 'Steps', icon: '👣', unit: 'steps' },
    { value: 'sleep', label: 'Sleep', icon: '😴', unit: 'hours' },
    { value: 'heart_rate', label: 'Heart Rate', icon: '❤️', unit: 'bpm' },
    { value: 'weight', label: 'Weight', icon: '⚖️', unit: 'kg' },
    { value: 'mood', label: 'Mood', icon: '😊', unit: '1-10' },
    { value: 'blood_pressure', label: 'Blood Pressure', icon: '🩺', unit: 'mmHg' },
    { value: 'glucose', label: 'Blood Glucose', icon: '🩸', unit: 'mg/dL' },
  ];

  return (
    <div className="min-h-screen  p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-display text-accent-primary mb-8">
          Health Tracking
        </h1>

        {/* Quick Add Form */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-2xl font-display mb-4">Log Health Data</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-primary"
                >
                  {healthTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Value
                </label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder={`Enter ${healthTypes.find(t => t.value === formData.type)?.unit || 'value'}`}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-primary"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Notes (optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-primary"
                rows={3}
              />
            </div>
            <button
              type="submit"
              className="bg-accent-primary text-white px-6 py-3 rounded-lg hover:bg-accent-primary/90 transition-colors"
            >
              Log Data + Earn 1 $tabledadrian
            </button>
          </form>
        </div>

        {/* Health Data Display */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-display mb-4">Recent Data</h2>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : healthData.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              No health data logged yet. Start tracking to earn $tabledadrian rewards!
            </div>
          ) : (
            <div className="space-y-4">
              {healthData.map((data: any) => (
                <div
                  key={data.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div>
                    <div className="font-semibold text-text-primary">
                      {healthTypes.find(t => t.value === data.type)?.icon} {healthTypes.find(t => t.value === data.type)?.label}
                    </div>
                    <div className="text-text-secondary text-sm">
                      {data.value} {data.unit || healthTypes.find(t => t.value === data.type)?.unit}
                    </div>
                    {data.notes && (
                      <div className="text-text-secondary text-sm mt-1">{data.notes}</div>
                    )}
                  </div>
                  <div className="text-text-secondary text-sm">
                    {new Date(data.recordedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Wearable Integration */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-display mb-4">Connect Wearables</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-accent-primary transition-colors">
              <div className="text-3xl mb-2">⌚</div>
              <div className="font-semibold">Apple Watch</div>
              <div className="text-sm text-text-secondary">Connect</div>
            </button>
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-accent-primary transition-colors">
              <div className="text-3xl mb-2">📊</div>
              <div className="font-semibold">Fitbit</div>
              <div className="text-sm text-text-secondary">Connect</div>
            </button>
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-accent-primary transition-colors">
              <div className="text-3xl mb-2">💍</div>
              <div className="font-semibold">Oura Ring</div>
              <div className="text-sm text-text-secondary">Connect</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

