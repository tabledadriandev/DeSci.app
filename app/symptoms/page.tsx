'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, AlertCircle } from 'lucide-react';

const MOODS = ['happy', 'anxious', 'depressed', 'neutral', 'stressed', 'energetic', 'tired'];
const PAIN_LOCATIONS = ['head', 'neck', 'back', 'chest', 'stomach', 'joints', 'muscles', 'other'];
const DIGESTIVE_ISSUES = ['bloating', 'gas', 'constipation', 'diarrhea', 'nausea', 'heartburn', 'cramps'];

export default function SymptomsPage() {
  const { address } = useAccount();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [symptoms, setSymptoms] = useState<any[]>([]);
  const [patterns, setPatterns] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    energyLevel: 5,
    mood: '',
    sleepQuality: 5,
    sleepHours: 8,
    painLocations: [] as string[],
    painIntensity: [] as Array<{ location: string; intensity: number }>,
    headaches: false,
    migraine: false,
    digestiveIssues: [] as string[],
    customSymptoms: [] as string[],
    activities: [] as string[],
    meals: [] as string[],
    notes: '',
  });

  useEffect(() => {
    if (address) {
      loadSymptoms();
      analyzePatterns();
    }
  }, [address]);

  const loadSymptoms = async () => {
    try {
      const response = await fetch(`/api/health/symptoms?userId=${address}`);
      const data = await response.json();
      setSymptoms(data);
    } catch (error) {
      console.error('Error loading symptoms:', error);
    }
  };

  const analyzePatterns = async () => {
    try {
      const response = await fetch(`/api/health/symptoms/patterns?userId=${address}`);
      const data = await response.json();
      setPatterns(data);
    } catch (error) {
      console.error('Error analyzing patterns:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    try {
      const response = await fetch('/api/health/symptoms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: address,
          date: selectedDate,
          ...formData,
        }),
      });

      if (response.ok) {
        await loadSymptoms();
        await analyzePatterns();
        setFormData({
          energyLevel: 5,
          mood: '',
          sleepQuality: 5,
          sleepHours: 8,
          painLocations: [],
          painIntensity: [],
          headaches: false,
          migraine: false,
          digestiveIssues: [],
          customSymptoms: [],
          activities: [],
          meals: [],
          notes: '',
        });
      }
    } catch (error) {
      console.error('Error saving symptoms:', error);
    }
  };

  return (
    <div className="min-h-screen  p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-display text-accent-primary mb-8">
          Symptom Tracker
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-2xl font-display mb-4">Log Daily Symptoms</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Energy Level: {formData.energyLevel}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.energyLevel}
                    onChange={(e) => setFormData({ ...formData, energyLevel: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Mood</label>
                  <div className="grid grid-cols-4 gap-2">
                    {MOODS.map((mood) => (
                      <button
                        key={mood}
                        type="button"
                        onClick={() => setFormData({ ...formData, mood })}
                        className={`p-3 rounded-lg border-2 ${
                          formData.mood === mood
                            ? 'border-accent-primary bg-accent-primary/10'
                            : 'border-gray-200'
                        }`}
                      >
                        {mood.charAt(0).toUpperCase() + mood.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Sleep Quality: {formData.sleepQuality}/10
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={formData.sleepQuality}
                      onChange={(e) => setFormData({ ...formData, sleepQuality: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Sleep Hours</label>
                    <input
                      type="number"
                      min="0"
                      max="24"
                      step="0.5"
                      value={formData.sleepHours}
                      onChange={(e) => setFormData({ ...formData, sleepHours: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Pain Locations</label>
                  <div className="grid grid-cols-4 gap-2">
                    {PAIN_LOCATIONS.map((location) => (
                      <button
                        key={location}
                        type="button"
                        onClick={() => {
                          const updated = formData.painLocations.includes(location)
                            ? formData.painLocations.filter(l => l !== location)
                            : [...formData.painLocations, location];
                          setFormData({ ...formData, painLocations: updated });
                        }}
                        className={`p-2 rounded-lg border-2 text-sm ${
                          formData.painLocations.includes(location)
                            ? 'border-accent-primary bg-accent-primary/10'
                            : 'border-gray-200'
                        }`}
                      >
                        {location}
                      </button>
                    ))}
                  </div>
                  {formData.painLocations.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {formData.painLocations.map((location) => (
                        <div key={location} className="flex items-center gap-3">
                          <span className="w-24 text-sm">{location}:</span>
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={formData.painIntensity.find(p => p.location === location)?.intensity || 5}
                            onChange={(e) => {
                              const updated = formData.painIntensity.filter(p => p.location !== location);
                              updated.push({ location, intensity: parseInt(e.target.value) });
                              setFormData({ ...formData, painIntensity: updated });
                            }}
                            className="flex-1"
                          />
                          <span className="w-8 text-center text-sm">
                            {formData.painIntensity.find(p => p.location === location)?.intensity || 5}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Digestive Issues</label>
                  <div className="grid grid-cols-4 gap-2">
                    {DIGESTIVE_ISSUES.map((issue) => (
                      <button
                        key={issue}
                        type="button"
                        onClick={() => {
                          const updated = formData.digestiveIssues.includes(issue)
                            ? formData.digestiveIssues.filter(i => i !== issue)
                            : [...formData.digestiveIssues, issue];
                          setFormData({ ...formData, digestiveIssues: updated });
                        }}
                        className={`p-2 rounded-lg border-2 text-sm ${
                          formData.digestiveIssues.includes(issue)
                            ? 'border-accent-primary bg-accent-primary/10'
                            : 'border-gray-200'
                        }`}
                      >
                        {issue}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.headaches}
                      onChange={(e) => setFormData({ ...formData, headaches: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span>Headaches</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.migraine}
                      onChange={(e) => setFormData({ ...formData, migraine: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span>Migraine</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                    placeholder="Additional notes about your symptoms..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90"
                >
                  Save Symptom Log
                </button>
              </form>
            </div>

            {/* Symptom Calendar */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-display mb-4 flex items-center gap-2">
                <Calendar className="w-6 h-6" />
                Symptom Calendar
              </h2>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 30 }, (_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - (29 - i));
                  const dateStr = date.toISOString().split('T')[0];
                  const daySymptoms = symptoms.find(s => s.date.split('T')[0] === dateStr);
                  
                  return (
                    <div
                      key={i}
                      className={`aspect-square rounded-lg p-2 text-center text-xs ${
                        daySymptoms
                          ? daySymptoms.energyLevel < 5
                            ? 'bg-red-100 border-2 border-red-300'
                            : daySymptoms.energyLevel < 7
                            ? 'bg-yellow-100 border-2 border-yellow-300'
                            : 'bg-green-100 border-2 border-green-300'
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="font-semibold">{date.getDate()}</div>
                      {daySymptoms && (
                        <div className="text-xs mt-1">
                          {daySymptoms.energyLevel}/10
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Patterns & Insights */}
          <div className="space-y-6">
            {patterns && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-display mb-4 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6" />
                  Pattern Insights
                </h2>
                <div className="space-y-4">
                  {patterns.correlations && patterns.correlations.length > 0 ? (
                    patterns.correlations.map((corr: any, idx: number) => (
                      <div key={idx} className="p-3 bg-cream/50 rounded-lg">
                        <div className="font-semibold text-sm mb-1">{corr.pattern}</div>
                        <div className="text-xs text-text-secondary">{corr.description}</div>
                      </div>
                    ))
                  ) : (
                    <p className="text-text-secondary text-sm">
                      Log more symptoms to see pattern insights
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Recent Symptoms */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-display mb-4">Recent Logs</h2>
              <div className="space-y-3">
                {symptoms.slice(0, 5).map((symptom: any) => (
                  <div key={symptom.id} className="p-3 bg-cream/50 rounded-lg">
                    <div className="font-semibold text-sm">
                      {new Date(symptom.date).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-text-secondary mt-1">
                      Energy: {symptom.energyLevel}/10 • Mood: {symptom.mood || 'N/A'}
                    </div>
                    {symptom.painLocations.length > 0 && (
                      <div className="text-xs text-red-600 mt-1">
                        Pain: {symptom.painLocations.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
                {symptoms.length === 0 && (
                  <p className="text-text-secondary text-sm text-center py-4">
                    No symptoms logged yet
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

