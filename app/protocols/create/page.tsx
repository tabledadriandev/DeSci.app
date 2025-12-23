/**
 * Create New Protocol Page
 * Form to generate a 30-day biohacking protocol
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { glassEntranceAnimation } from '@/lib/animations/glassEntrance';

export default function CreateProtocolPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    goal: 'improve_sleep',
    commitmentLevel: 'medium' as 'low' | 'medium' | 'high',
    availableTime: 60,
    preferences: {
      food: [] as string[],
      exercises: [] as string[],
      supplements: [] as string[],
      timeOfDay: [] as string[],
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/protocols/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Failed to create protocol');
      }

      const json = await res.json();
      router.push(`/protocols/${json.protocol.id}`);
    } catch (error) {
      console.error('Protocol creation error:', error);
      alert('Failed to create protocol. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <motion.div
        variants={glassEntranceAnimation}
        initial="initial"
        animate="animate"
        className="mb-8"
      >
        <Link
          href="/protocols"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Protocols</span>
        </Link>
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Create New Protocol
        </h1>
        <p className="text-text-secondary">
          Generate a personalized 30-day biohacking experiment
        </p>
      </motion.div>

      {/* Form */}
      <motion.form
        variants={glassEntranceAnimation}
        initial="initial"
        animate="animate"
        onSubmit={handleSubmit}
        className="glass-card p-6 rounded-2xl space-y-6"
      >
        {/* Protocol Name */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Protocol Name
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Cold Plunge Challenge"
            className="w-full px-4 py-2 bg-bg-elevated border border-border-light rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Goal */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Primary Goal
          </label>
          <select
            value={formData.goal}
            onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
            className="w-full px-4 py-2 bg-bg-elevated border border-border-light rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="improve_sleep">Improve Sleep Quality</option>
            <option value="boost_hrv">Boost HRV</option>
            <option value="lose_weight">Lose Weight</option>
            <option value="increase_energy">Increase Energy</option>
            <option value="reduce_stress">Reduce Stress</option>
            <option value="improve_recovery">Improve Recovery</option>
          </select>
        </div>

        {/* Commitment Level */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Commitment Level
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['low', 'medium', 'high'] as const).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setFormData({ ...formData, commitmentLevel: level })}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  formData.commitmentLevel === level
                    ? 'bg-primary text-white border-primary'
                    : 'bg-bg-elevated border-border-light text-text-primary hover:border-primary'
                }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Available Time */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Available Time (minutes per day)
          </label>
          <input
            type="number"
            min="15"
            max="180"
            step="15"
            value={formData.availableTime}
            onChange={(e) =>
              setFormData({ ...formData, availableTime: parseInt(e.target.value) })
            }
            className="w-full px-4 py-2 bg-bg-elevated border border-border-light rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Preferences */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Preferred Interventions
          </label>
          <div className="space-y-3">
            {/* Exercises */}
            <div>
              <p className="text-xs text-text-secondary mb-2">Exercises</p>
              <div className="flex flex-wrap gap-2">
                {['cold_plunge', 'meditation', 'breathwork', 'sauna', 'yoga'].map(
                  (exercise) => (
                    <button
                      key={exercise}
                      type="button"
                      onClick={() => {
                        const exercises = formData.preferences.exercises || [];
                        setFormData({
                          ...formData,
                          preferences: {
                            ...formData.preferences,
                            exercises: exercises.includes(exercise)
                              ? exercises.filter((e) => e !== exercise)
                              : [...exercises, exercise],
                          },
                        });
                      }}
                      className={`px-3 py-1 rounded-full text-xs transition-colors ${
                        formData.preferences.exercises?.includes(exercise)
                          ? 'bg-primary text-white'
                          : 'bg-bg-elevated border border-border-light text-text-primary hover:border-primary'
                      }`}
                    >
                      {exercise.replace('_', ' ')}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !formData.name}
          className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating Protocol...</span>
            </>
          ) : (
            <span>Create Protocol</span>
          )}
        </button>
      </motion.form>
    </div>
  );
}
