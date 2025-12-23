'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, Flame, Calendar, TrendingUp } from 'lucide-react';
import AnimatedCard from '@/components/ui/AnimatedCard';
import ProgressBar from '@/components/ui/ProgressBar';
import PageTransition from '@/components/ui/PageTransition';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations/variants';

export default function DailyHabitsPage() {
  const { address } = useAccount();
  const [today, setToday] = useState(new Date().toISOString().split('T')[0]);
  const [habits, setHabits] = useState<any>(null);
  const [streak, setStreak] = useState(0);
  const [weeklySummary, setWeeklySummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (address) {
      loadTodayHabits();
      loadStreak();
      loadWeeklySummary();
    }
  }, [address, today]);

  const loadTodayHabits = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/health/habits?userId=${address}&date=${today}`);
      const data = await response.json();
      setHabits(data);
    } catch (error) {
      console.error('Error loading habits:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStreak = async () => {
    try {
      const response = await fetch(`/api/health/habits/streak?userId=${address}`);
      const data = await response.json();
      setStreak(data.streak || 0);
    } catch (error) {
      console.error('Error loading streak:', error);
    }
  };

  const loadWeeklySummary = async () => {
    try {
      const response = await fetch(`/api/health/habits/weekly?userId=${address}`);
      const data = await response.json();
      setWeeklySummary(data);
    } catch (error) {
      console.error('Error loading weekly summary:', error);
    }
  };

  const updateHabit = async (field: string, value: any) => {
    if (!address) return;

    try {
      const response = await fetch('/api/health/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: address,
          date: today,
          [field]: value,
        }),
      });

      if (response.ok) {
        await loadTodayHabits();
        await loadStreak();
        await loadWeeklySummary();
      }
    } catch (error) {
      console.error('Error updating habit:', error);
    }
  };

  const habitFields = [
    {
      key: 'waterIntake',
      label: 'Water Intake',
      icon: '💧',
      unit: 'liters',
      type: 'number',
      min: 0,
      max: 10,
      step: 0.25,
      target: 2.5,
    },
    {
      key: 'steps',
      label: 'Steps',
      icon: '👣',
      unit: 'steps',
      type: 'number',
      min: 0,
      target: 10000,
    },
    {
      key: 'meditationMinutes',
      label: 'Meditation',
      icon: '🧘',
      unit: 'minutes',
      type: 'number',
      min: 0,
      target: 10,
    },
    {
      key: 'sleepHours',
      label: 'Sleep',
      icon: '😴',
      unit: 'hours',
      type: 'number',
      min: 0,
      max: 24,
      step: 0.5,
      target: 8,
    },
    {
      key: 'exerciseCompleted',
      label: 'Exercise',
      icon: '💪',
      type: 'boolean',
    },
    {
      key: 'exerciseType',
      label: 'Exercise Type',
      icon: '🏃',
      type: 'select',
      options: ['Walking', 'Running', 'Cycling', 'Weight Training', 'Yoga', 'Swimming', 'Other'],
    },
    {
      key: 'exerciseDuration',
      label: 'Exercise Duration',
      icon: '⏱️',
      unit: 'minutes',
      type: 'number',
      min: 0,
      target: 30,
    },
  ];

  if (loading && !habits) {
    return (
      <PageTransition>
        <div className="min-h-screen  flex items-center justify-center">
          <LoadingSpinner size="lg" text="Loading your habits..." />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen  p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInUp}
          >
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                Daily Habits Tracker
              </h1>
              <p className="text-text-secondary text-lg">
                Track your daily wellness habits and build consistency
              </p>
            </div>
            <div className="flex items-center gap-4">
              <AnimatedCard className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <div>
                    <div className="text-xs text-text-secondary">Current Streak</div>
                    <div className="font-bold text-accent-primary text-lg">{streak} days</div>
                  </div>
                </div>
              </AnimatedCard>
              <input
                type="date"
                value={today}
                onChange={(e) => setToday(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
            </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Habits Form */}
            <div className="lg:col-span-2">
              <motion.div
                initial="initial"
                animate="animate"
                variants={staggerContainer}
              >
                <AnimatedCard>
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-text-primary">
                    <Calendar className="w-6 h-6 text-accent-primary" />
                    Today's Habits
                  </h2>
                  <div className="space-y-6">
                    {habitFields.map((field, index) => (
                      <motion.div
                        key={field.key}
                        variants={staggerItem}
                      >
                        <div className="border-b border-gray-200 pb-6 last:border-0">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{field.icon}</span>
                            <div>
                              <h3 className="font-semibold text-text-primary">{field.label}</h3>
                              {field.target && (
                                <p className="text-xs text-text-secondary">
                                  Target: {field.target} {field.unit || ''}
                                </p>
                              )}
                            </div>
                          </div>
                          {field.type === 'boolean' ? (
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <button
                                onClick={() => updateHabit(field.key, !habits?.[field.key])}
                                className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
                                  habits?.[field.key]
                                    ? 'bg-semantic-success text-white'
                                    : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                                }`}
                              >
                              {habits?.[field.key] ? (
                                <CheckCircle className="w-6 h-6" />
                              ) : (
                                <Circle className="w-6 h-6" />
                              )}
                              </button>
                            </motion.div>
                          ) : field.type === 'select' ? (
                            <select
                              value={habits?.[field.key] || ''}
                              onChange={(e) => updateHabit(field.key, e.target.value)}
                              className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-accent-primary"
                            >
                              <option value="">Select...</option>
                              {field.options?.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div className="flex items-center gap-2">
                              <input
                                type={field.type}
                                min={field.min}
                                max={field.max}
                                step={field.step}
                                value={habits?.[field.key] || ''}
                                onChange={(e) =>
                                  updateHabit(
                                    field.key,
                                    field.type === 'number'
                                      ? parseFloat(e.target.value) || 0
                                      : e.target.value
                                  )
                                }
                                className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-right bg-white focus:outline-none focus:ring-2 focus:ring-accent-primary"
                                placeholder="0"
                              />
                              {field.unit && (
                                <span className="text-sm text-text-secondary w-16">
                                  {field.unit}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        {field.target && habits?.[field.key] && (
                          <div className="mt-3">
                            <ProgressBar
                              value={(habits[field.key] / field.target) * 100}
                              max={100}
                              color={
                                (habits[field.key] / field.target) >= 1
                                  ? 'success'
                                  : (habits[field.key] / field.target) >= 0.7
                                  ? 'warning'
                                  : 'error'
                              }
                              size="sm"
                              animated
                              showValue={false}
                            />
                            <div className="text-xs text-text-secondary mt-1">
                              {((habits[field.key] / field.target) * 100).toFixed(0)}% of target
                            </div>
                          </div>
                        )}
                        </div>
                      </motion.div>
                    ))}

                    <div>
                      <label className="block text-sm font-medium mb-2 text-text-primary">Supplements Taken</label>
                      <div className="flex flex-wrap gap-2">
                        {['Vitamin D', 'Vitamin B12', 'Omega-3', 'Magnesium', 'Iron', 'Multivitamin'].map((supp) => (
                          <motion.div
                            key={supp}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                const current = habits?.supplements || [];
                                const updated = current.includes(supp)
                                  ? current.filter((s: string) => s !== supp)
                                  : [...current, supp];
                                updateHabit('supplements', updated);
                              }}
                              className={`px-4 py-2 rounded-lg border-2 transition ${
                                habits?.supplements?.includes(supp)
                                  ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                                  : 'border-gray-200 text-text-secondary hover:border-gray-300'
                              }`}
                            >
                              {supp}
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </AnimatedCard>
              </motion.div>

              {/* Weekly Calendar View */}
              {weeklySummary && (
                <AnimatedCard className="mt-6">
                  <h2 className="text-2xl font-bold mb-4 text-text-primary">Weekly Overview</h2>
                  <div className="grid grid-cols-7 gap-2">
                    {weeklySummary.days?.map((day: any, idx: number) => (
                      <motion.div
                        key={idx}
                        whileHover={{ scale: 1.05 }}
                      >
                        <div className={`aspect-square rounded-lg p-2 text-center text-xs border-2 ${
                          day.completed
                            ? 'bg-green-100 border-green-300'
                            : 'bg-gray-50 border-gray-200'
                        }`}>
                        <div className="font-semibold">{day.date}</div>
                        <div className="mt-1">
                          {day.completed ? (
                            <CheckCircle className="w-4 h-4 mx-auto text-green-600" />
                          ) : (
                            <Circle className="w-4 h-4 mx-auto text-gray-400" />
                          )}
                        </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </AnimatedCard>
              )}
            </div>

            {/* Stats & Insights */}
            <div className="space-y-6">
              {/* Today's Progress */}
              <AnimatedCard>
                <h2 className="text-xl font-bold mb-4 text-text-primary">Today's Progress</h2>
                <div className="space-y-3">
                  {habitFields
                    .filter(f => f.target && habits?.[f.key])
                    .map((field) => {
                      const progress = field.target ? (habits[field.key] / field.target) * 100 : 0;
                      return (
                        <div key={field.key}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-text-secondary">{field.label}</span>
                            <span className="font-semibold text-text-primary">
                              {habits[field.key]} / {field.target}
                            </span>
                          </div>
                          <ProgressBar
                            value={progress}
                            max={100}
                            color={progress >= 100 ? 'success' : progress >= 70 ? 'warning' : 'error'}
                            size="sm"
                            animated
                            showValue={false}
                          />
                        </div>
                      );
                    })}
                </div>
              </AnimatedCard>

              {/* Weekly Stats */}
              {weeklySummary && (
                <AnimatedCard>
                  <h2 className="text-xl font-bold mb-4 text-text-primary">Weekly Stats</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Days Completed</span>
                      <span className="font-semibold text-text-primary">
                        {weeklySummary.completedDays} / {weeklySummary.totalDays}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Average Water</span>
                      <span className="font-semibold text-text-primary">
                        {weeklySummary.avgWater?.toFixed(1) || 0}L
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Average Steps</span>
                      <span className="font-semibold text-text-primary">
                        {weeklySummary.avgSteps?.toFixed(0) || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Exercise Days</span>
                      <span className="font-semibold text-text-primary">
                        {weeklySummary.exerciseDays || 0}
                      </span>
                    </div>
                  </div>
                </AnimatedCard>
              )}

              {/* Streak Info */}
              <AnimatedCard className="bg-gradient-to-br from-orange-400 to-red-500 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <Flame className="w-8 h-8" />
                  <h2 className="text-2xl font-bold">Current Streak</h2>
                </div>
                <div className="text-5xl font-bold mb-2">{streak}</div>
                <p className="text-orange-100">Keep it up! You're doing great.</p>
              </AnimatedCard>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

