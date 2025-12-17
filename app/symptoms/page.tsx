'use client';

import { useState, useEffect } from 'react';
import { useAccount } from '@/hooks/useAccount';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, AlertCircle, AlertTriangle, Smile, Meh, Frown, Plus, Activity, Zap } from 'lucide-react';
import PageTransition from '@/components/ui/PageTransition';
import AnimatedButton from '@/components/ui/AnimatedButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';

const MOODS = ['happy', 'anxious', 'depressed', 'neutral', 'stressed', 'energetic', 'tired'];
const PAIN_LOCATIONS = ['head', 'neck', 'back', 'chest', 'stomach', 'joints', 'muscles', 'other'];
const DIGESTIVE_ISSUES = ['bloating', 'gas', 'constipation', 'diarrhea', 'nausea', 'heartburn', 'cramps'];

export default function SymptomsPage() {
  const { address } = useAccount();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [symptoms, setSymptoms] = useState<any[]>([]);
  const [patterns, setPatterns] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
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
    notes: '',
  });

  useEffect(() => {
    // Mock data for now
    setTimeout(() => {
      setSymptoms([
        { id: '1', date: new Date(Date.now() - 86400000).toISOString(), energyLevel: 6, mood: 'neutral' },
        { id: '2', date: new Date(Date.now() - 86400000 * 2).toISOString(), energyLevel: 4, mood: 'tired', painLocations: ['head'] },
      ]);
      setPatterns({
        correlations: [{ pattern: 'Low sleep quality correlates with next-day headaches.', description: 'You reported headaches on 3 out of 4 days following a sleep quality score below 5.' }],
      });
      setLoading(false);
    }, 1000);
  }, [address]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;
    setLoading(true);
    setTimeout(() => {
      alert('Symptoms logged! (Mock)');
      setLoading(false);
    }, 1000);
  };

  return (
    <PageTransition>
      <div className="p-4 sm:p-6 lg:p-8">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-crypto-gradient text-transparent bg-clip-text mb-2">
            Symptom Tracker
          </h1>
          <p className="text-base text-text-secondary max-w-2xl">
            Log your daily symptoms to uncover patterns and correlations in your health data.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <LoadingSpinner text="Loading your symptom data..." />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <motion.div variants={fadeInUp} className="lg:col-span-2 glass-card p-6">
              <h2 className="text-2xl font-bold text-text-primary mb-4">Log Daily Symptoms</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-3 bg-bg-surface border border-border-medium rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
                  />
                </div>
                
                <FormSection title="Energy & Mood" icon={<Zap />}>
                  <SliderRow label="Energy Level" value={formData.energyLevel} onChange={(val) => setFormData({...formData, energyLevel: val})} />
                  <div className="pt-4">
                    <label className="block text-sm font-medium text-text-secondary mb-3">Mood</label>
                    <div className="grid grid-cols-4 gap-2">
                      {MOODS.map((mood) => (
                        <button
                          key={mood}
                          type="button"
                          onClick={() => setFormData({ ...formData, mood })}
                          className={`glass-card-hover p-3 rounded-lg border-2 text-sm transition ${
                            formData.mood === mood
                              ? 'border-accent-primary bg-accent-primary/10'
                              : 'border-border-medium hover:border-accent-secondary/50'
                          }`}
                        >
                          {mood.charAt(0).toUpperCase() + mood.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </FormSection>

                <FormSection title="Pain & Discomfort" icon={<AlertTriangle />}>
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
                        className={`glass-card-hover p-2 rounded-lg border-2 text-sm transition ${
                          formData.painLocations.includes(location)
                            ? 'border-accent-primary bg-accent-primary/10'
                            : 'border-border-medium hover:border-accent-secondary/50'
                        }`}
                      >
                        {location}
                      </button>
                    ))}
                  </div>
                </FormSection>

                <FormSection title="Digestion" icon={<Activity />}>
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
                        className={`glass-card-hover p-2 rounded-lg border-2 text-sm transition ${
                          formData.digestiveIssues.includes(issue)
                            ? 'border-accent-primary bg-accent-primary/10'
                            : 'border-border-medium hover:border-accent-secondary/50'
                        }`}
                      >
                        {issue}
                      </button>
                    ))}
                  </div>
                </FormSection>

                <AnimatedButton type="submit" className="w-full">
                  Save Symptom Log
                </AnimatedButton>
              </form>
            </motion.div>

            {/* Patterns & Insights */}
            <div className="space-y-6">
              {patterns && (
                <motion.div variants={fadeInUp} className="glass-card p-6">
                  <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-accent-primary" /> Pattern Insights
                  </h2>
                  <div className="space-y-4">
                    {patterns.correlations?.map((corr: any, idx: number) => (
                      <div key={idx} className="glass-card p-3">
                        <p className="font-semibold text-text-primary text-sm mb-1">{corr.pattern}</p>
                        <p className="text-xs text-text-secondary">{corr.description}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Recent Symptoms */}
              <motion.div variants={fadeInUp} className="glass-card p-6">
                <h2 className="text-xl font-bold text-text-primary mb-4">Recent Logs</h2>
                <div className="space-y-3">
                  {symptoms.slice(0, 5).map((symptom: any) => (
                    <div key={symptom.id} className="glass-card-hover p-3">
                      <p className="font-semibold text-sm text-text-primary">
                        {new Date(symptom.date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-text-secondary mt-1">
                        Energy: {symptom.energyLevel}/10 • Mood: {symptom.mood || 'N/A'}
                      </p>
                    </div>
                  ))}
                  {symptoms.length === 0 && (
                    <p className="text-text-secondary text-sm text-center py-4">
                      No symptoms logged yet.
                    </p>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}

const FormSection = ({ title, icon, children }: { title: string, icon: React.ReactElement, children: React.ReactNode }) => (
  <div className="pt-4 border-t border-border-medium">
    <label className="block text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
      {icon} {title}
    </label>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const SliderRow = ({ label, value, onChange }: { label: string, value: number, onChange: (val: number) => void }) => (
  <div>
    <label className="block text-sm font-medium text-text-secondary mb-2">
      {label}: {value}/10
    </label>
    <div className="flex items-center gap-4">
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="flex-1 h-2 bg-bg-elevated rounded-lg appearance-none cursor-pointer accent-accent-primary"
      />
      <span className="text-2xl font-bold text-accent-primary w-12 text-center">
        {value}
      </span>
    </div>
  </div>
);

