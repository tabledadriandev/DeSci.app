'use client';

import { useState, useEffect } from 'react';
import { useAccount } from '@/hooks/useAccount';
import { motion } from 'framer-motion';
import PageTransition from '@/components/ui/PageTransition';
import AnimatedButton from '@/components/ui/AnimatedButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';
import { Heart, Activity, Sun, Footprints, Scale, Apple, MonitorSmartphone, Plus } from 'lucide-react';
import Link from 'next/link';

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
    // Mock data for now
    setHealthData([
      { id: '1', type: 'steps', value: 8500, unit: 'steps', recordedAt: new Date(Date.now() - 3600000).toISOString(), notes: 'Evening walk' },
      { id: '2', type: 'sleep', value: 7.5, unit: 'hours', recordedAt: new Date(Date.now() - 86400000).toISOString(), notes: 'Good quality sleep' },
      { id: '3', type: 'heart_rate', value: 68, unit: 'bpm', recordedAt: new Date(Date.now() - 1800000).toISOString(), notes: 'Resting heart rate' },
    ]);
    setLoading(false);
  }, [address]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !formData.value.trim()) return;
    setLoading(true);

    // Mock API call
    setTimeout(() => {
      const newData = {
        id: (Math.random() * 1000).toFixed(0),
        type: formData.type,
        value: parseFloat(formData.value),
        unit: formData.unit || healthTypes.find(t => t.value === formData.type)?.unit,
        notes: formData.notes,
        source: 'manual',
        recordedAt: new Date().toISOString(),
      };
      setHealthData((prev) => [newData, ...prev]);
      setFormData({ type: 'steps', value: '', unit: '', notes: '', source: 'manual' });
      setLoading(false);
      alert('Health data logged! Earned 1 $TA (Mock)');
    }, 1000);
  };

  const healthTypes = [
    { value: 'steps', label: 'Steps', icon: Footprints, unit: 'steps' },
    { value: 'sleep', label: 'Sleep', icon: Sun, unit: 'hours' },
    { value: 'heart_rate', label: 'Heart Rate', icon: Heart, unit: 'bpm' },
    { value: 'weight', label: 'Weight', icon: Scale, unit: 'kg' },
    { value: 'mood', label: 'Mood', icon: Activity, unit: '1-10' },
    { value: 'blood_pressure', label: 'Blood Pressure', icon: Scale, unit: 'mmHg' }, // Reusing scale for now
    { value: 'glucose', label: 'Blood Glucose', icon: Apple, unit: 'mg/dL' }, // Reusing apple for now
  ];

  return (
    <PageTransition>
      <div className="page-container">
        <motion.div initial="initial" animate="animate" variants={fadeInUp} className="page-header">
          <h1 className="page-title">Health Tracking Hub</h1>
          <p className="page-subtitle max-w-2xl">
            Log your daily health metrics, earn rewards, and integrate with your wearables.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <LoadingSpinner text="Loading health data..." />
          </div>
        ) : (
          <>
            {/* Quick Add Form */}
            <motion.div className="section-card mb-6" variants={fadeInUp}>
              <h2 className="section-title">Log New Data</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Metric Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value, unit: healthTypes.find(t => t.value === e.target.value)?.unit || '' })}
                      className="form-select"
                    >
                      {healthTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label} ({type.unit})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Value</label>
                    <input
                      type="number"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      placeholder={`Enter ${healthTypes.find(t => t.value === formData.type)?.unit || 'value'}`}
                      className="form-input"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label">Notes (optional)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="form-textarea"
                    rows={3}
                  />
                </div>
                <AnimatedButton type="submit" icon={<Plus className="w-5 h-5" />} disabled={!formData.value.trim()}>
                  Log Data + Earn 1 $TA
                </AnimatedButton>
              </form>
            </motion.div>

            {/* Health Data Display */}
            <motion.div className="section-card mb-6" variants={fadeInUp}>
              <h2 className="section-title">Recent Data Entries</h2>
              {healthData.length === 0 ? (
                <div className="empty-state">
                  <p className="empty-state-description">
                    No health data logged yet. Start tracking to earn $TA rewards!
                  </p>
                </div>
              ) : (
                <motion.div className="space-y-3" variants={staggerContainer} initial="initial" animate="animate">
                  {healthData.map((data: any) => {
                    const HealthIcon = healthTypes.find(t => t.value === data.type)?.icon;
                    return (
                      <motion.div
                        key={data.id}
                        variants={fadeInUp}
                        className="glass-card-hover p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="icon-box">
                            {HealthIcon && <HealthIcon className="w-4 h-4 text-accent-primary" />}
                          </div>
                          <div>
                            <p className="font-semibold text-text-primary text-sm">
                              {healthTypes.find(t => t.value === data.type)?.label}
                            </p>
                            <p className="text-text-secondary text-sm">
                              {data.value} {data.unit}
                            </p>
                            {data.notes && (
                              <p className="text-text-tertiary text-xs mt-1">{data.notes}</p>
                            )}
                          </div>
                        </div>
                        <p className="text-text-tertiary text-xs">
                          {new Date(data.recordedAt).toLocaleDateString()}
                        </p>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </motion.div>

            {/* Wearable Integration */}
            <motion.div className="section-card" variants={fadeInUp}>
              <h2 className="section-title">Connect Wearables</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Link href="/wearables">
                  <AnimatedButton variant="secondary" icon={<MonitorSmartphone className="w-4 h-4" />} className="w-full">
                    Apple Health
                  </AnimatedButton>
                </Link>
                <Link href="/wearables">
                  <AnimatedButton variant="secondary" icon={<MonitorSmartphone className="w-4 h-4" />} className="w-full">
                    Fitbit
                  </AnimatedButton>
                </Link>
                <Link href="/wearables">
                  <AnimatedButton variant="secondary" icon={<MonitorSmartphone className="w-4 h-4" />} className="w-full">
                    Oura Ring
                  </AnimatedButton>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </PageTransition>
  );
}


