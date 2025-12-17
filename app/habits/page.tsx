'use client';

import { useState, useEffect } from 'react';
import { useAccount } from '@/hooks/useAccount';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, Flame, Calendar, TrendingUp, SunMedium, Droplet, Footprints, Clock as ClockIcon, Bed, BookOpen, Activity } from 'lucide-react';
import PageTransition from '@/components/ui/PageTransition';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AnimatedButton from '@/components/ui/AnimatedButton';
import ProgressBar from '@/components/ui/ProgressBar'; // Import ProgressBar
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';

interface HabitEntry {
  key: string;
  label: string;
  icon: React.ReactElement;
  unit?: string;
  type: 'number' | 'boolean' | 'select';
  min?: number;
  max?: number;
  step?: number;
  target?: number;
  options?: string[];
}

const HABIT_FIELDS: HabitEntry[] = [
  { key: 'waterIntake', label: 'Water Intake', icon: <Droplet className="w-5 h-5 text-blue-300" />, unit: 'liters', type: 'number', min: 0, max: 10, step: 0.25, target: 2.5 },
  { key: 'steps', label: 'Steps', icon: <Footprints className="w-5 h-5 text-green-400" />, unit: 'steps', type: 'number', min: 0, target: 10000 },
  { key: 'meditationMinutes', label: 'Meditation', icon: <SunMedium className="w-5 h-5 text-yellow-400" />, unit: 'minutes', type: 'number', min: 0, target: 10 },
  { key: 'sleepHours', label: 'Sleep', icon: <Bed className="w-5 h-5 text-purple-400" />, unit: 'hours', type: 'number', min: 0, max: 24, step: 0.5, target: 8 },
  { key: 'exerciseCompleted', label: 'Exercise', icon: <Activity className="w-5 h-5 text-red-400" />, type: 'boolean' },
];

export default function DailyHabitsPage() {
  const { address } = useAccount();
  const [today, setToday] = useState(new Date().toISOString().split('T')[0]);
  const [habits, setHabits] = useState<any>({});
  const [streak, setStreak] = useState(0);
  const [weeklySummary, setWeeklySummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data loading
    setTimeout(() => {
      setHabits({
        waterIntake: 2.0,
        steps: 7500,
        meditationMinutes: 10,
        sleepHours: 7.5,
        exerciseCompleted: true,
        supplements: ['Vitamin D', 'Magnesium'],
      });
      setStreak(15);
      setWeeklySummary({
        completedDays: 5,
        totalDays: 7,
        avgWater: 2.2,
        avgSteps: 8000,
        exerciseDays: 4,
        days: [
          { date: 'Mon', completed: true }, { date: 'Tue', completed: true },
          { date: 'Wed', completed: false }, { date: 'Thu', completed: true },
          { date: 'Fri', completed: true }, { date: 'Sat', completed: false },
          { date: 'Sun', completed: false },
        ],
      });
      setLoading(false);
    }, 1000);
  }, [address, today]);

  const updateHabit = async (key: string, value: any) => {
    setHabits((prev: any) => ({ ...prev, [key]: value }));
    // Simulate API call
    console.log(`Updating habit ${key} to ${value}`);
  };

  return (
    <PageTransition>
      <div className="p-4 sm:p-6 lg:p-8">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-crypto-gradient text-transparent bg-clip-text mb-2">
                Daily Habits Tracker
              </h1>
              <p className="text-base text-text-secondary">
                Build consistency and optimize your wellness journey, day by day.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <motion.div className="glass-card-hover p-4 flex items-center gap-3 min-w-[180px]" variants={fadeInUp}>
                <Flame className="w-6 h-6 text-orange-400" />
                <div>
                  <p className="text-sm text-text-secondary">Current Streak</p>
                  <p className="font-bold text-accent-primary text-2xl">{streak} days</p>
                </div>
              </motion.div>
              <input
                type="date"
                value={today}
                onChange={(e) => setToday(e.target.value)}
                className="px-4 py-2 border border-border-medium rounded-lg bg-bg-surface shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-primary text-text-primary"
              />
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <LoadingSpinner text="Loading your habits..." />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Habits Form */}
            <motion.div className="lg:col-span-2 glass-card p-6" variants={fadeInUp}>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-text-primary">
                <Calendar className="w-7 h-7 text-accent-primary" />
                Today's Habits
              </h2>
              <div className="space-y-6">
                {HABIT_FIELDS.map((field, index) => (
                  <motion.div key={field.key} variants={fadeInUp} className="border-b border-border-medium pb-6 last:border-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        {field.icon}
                        <div>
                          <h3 className="font-semibold text-lg text-text-primary">{field.label}</h3>
                          {field.target && (
                            <p className="text-sm text-text-secondary">
                              Target: {field.target} {field.unit || ''}
                            </p>
                          )}
                        </div>
                      </div>
                      {field.type === 'boolean' ? (
                        <AnimatedButton
                          onClick={() => updateHabit(field.key, !habits?.[field.key])}
                          variant={habits?.[field.key] ? 'primary' : 'secondary'}
                          size="sm"
                          icon={habits?.[field.key] ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                        >
                          {habits?.[field.key] ? 'Completed' : 'Mark Done'}
                        </AnimatedButton>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input
                            type={field.type}
                            min={field.min}
                            max={field.max}
                            step={field.step}
                            value={habits?.[field.key] || ''}
                            onChange={(e) => updateHabit(field.key, field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                            className="w-24 px-3 py-2 border border-border-medium rounded-lg text-right bg-bg-surface focus:outline-none focus:ring-2 focus:ring-accent-primary/50 text-text-primary"
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
                        <p className="text-xs text-text-secondary mt-1">
                          {((habits[field.key] / field.target) * 100).toFixed(0)}% of target
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))}

                <div className="pt-4 border-t border-border-medium">
                  <label className="block text-lg font-semibold text-text-primary mb-3">Supplements Taken</label>
                  <div className="flex flex-wrap gap-2">
                    {['Vitamin D', 'Vitamin B12', 'Omega-3', 'Magnesium', 'Iron', 'Multivitamin', 'Creatine', 'Collagen'].map((supp) => (
                      <AnimatedButton
                        key={supp}
                        onClick={() => {
                          const current = habits?.supplements || [];
                          const updated = current.includes(supp) ? current.filter((s: string) => s !== supp) : [...current, supp];
                          updateHabit('supplements', updated);
                        }}
                        variant={habits?.supplements?.includes(supp) ? 'primary' : 'secondary'}
                        size="sm"
                      >
                        {supp}
                      </AnimatedButton>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stats & Insights */}
            <div className="space-y-6">
              {/* Today's Progress */}
              <motion.div className="glass-card p-6" variants={fadeInUp}>
                <h2 className="text-xl font-bold text-text-primary mb-4">Today's Progress</h2>
                <div className="space-y-3">
                  {HABIT_FIELDS
                    .filter(f => f.target) // Only show habits with a target
                    .map((field) => {
                      const progress = field.target ? (habits[field.key] / field.target) * 100 : 0;
                      return (
                        <div key={field.key}>
                          <div className="flex justify-between text-sm mb-1 text-text-secondary">
                            <span>{field.label}</span>
                            <span className="font-semibold text-text-primary">
                              {habits[field.key] || 0} / {field.target} {field.unit || ''}
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
              </motion.div>

              {/* Weekly Stats */}
              {weeklySummary && (
                <motion.div className="glass-card p-6" variants={fadeInUp}>
                  <h2 className="text-xl font-bold text-text-primary mb-4">Weekly Stats</h2>
                  <div className="space-y-3 text-text-secondary">
                    <div className="flex justify-between">
                      <span>Days Completed</span>
                      <span className="font-semibold text-text-primary">
                        {weeklySummary.completedDays} / {weeklySummary.totalDays}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Water</span>
                      <span className="font-semibold text-text-primary">
                        {weeklySummary.avgWater?.toFixed(1) || 0}L
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Steps</span>
                      <span className="font-semibold text-text-primary">
                        {weeklySummary.avgSteps?.toFixed(0) || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Exercise Days</span>
                      <span className="font-semibold text-text-primary">
                        {weeklySummary.exerciseDays || 0}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Weekly Calendar View */}
              {weeklySummary && (
                <motion.div className="glass-card p-6" variants={fadeInUp}>
                  <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-accent-primary" /> Weekly Overview
                  </h2>
                  <div className="grid grid-cols-7 gap-2">
                    {weeklySummary.days?.map((day: any, idx: number) => (
                      <motion.div
                        key={idx}
                        whileHover={{ scale: 1.05 }}
                        className={`glass-card p-2 text-center text-xs transition-all duration-300 ${
                          day.completed
                            ? 'bg-semantic-success/10 border-semantic-success'
                            : 'bg-bg-elevated border-border-medium'
                        }`}
                      >
                        <p className="font-semibold text-text-primary">{day.date}</p>
                        <div className="mt-1">
                          {day.completed ? (
                            <CheckCircle className="w-4 h-4 mx-auto text-semantic-success" />
                          ) : (
                            <Circle className="w-4 h-4 mx-auto text-text-tertiary" />
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}


