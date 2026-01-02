'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Utensils, Dumbbell, Pill, Moon, Heart, Calendar } from 'lucide-react';
import { glassEntranceAnimation } from '@/lib/animations/glassEntrance';
import { cn } from '@/lib/utils/cn';
import MainLayout from '@/components/layout/MainLayout';

export default function LongevityPlanPage() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    setUserId('current-user-id'); // Would come from auth
  }, []);

  // Fetch plan
  const { data, isLoading } = useQuery({
    queryKey: ['longevityPlan', userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await fetch(`/api/ai/longevity-plan?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch plan');
      return response.json();
    },
    enabled: !!userId,
  });

  // Generate plan mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/ai/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) throw new Error('Generation failed');
      return response.json();
    },
  });

  const plan = data?.plan;

  return (
    <MainLayout title="Your Longevity Plan" subtitle="AI-generated personalized protocol based on your data">
      <div className="max-w-6xl mx-auto space-y-6">
        <motion.div
          variants={glassEntranceAnimation}
          initial="initial"
          animate="animate"
          className="flex items-center justify-end mb-4"
        >
          <button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="btn-primary"
          >
            {generateMutation.isPending ? 'Generating...' : 'Generate New Plan'}
          </button>
        </motion.div>

        {plan ? (
          <>
            {/* Nutrition Plan */}
            <motion.div
              variants={glassEntranceAnimation}
              initial="initial"
              animate="animate"
              className="glass-card p-6 rounded-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <Utensils className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold text-text-primary">What to Eat</h2>
              </div>
              
              {plan.nutrition && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <p className="text-xs text-text-secondary mb-1">Calories</p>
                      <p className="text-lg font-bold font-mono text-primary">
                        {plan.nutrition.dailyMacros?.calories || 2000}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-success/10">
                      <p className="text-xs text-text-secondary mb-1">Protein</p>
                      <p className="text-lg font-bold font-mono text-success">
                        {plan.nutrition.dailyMacros?.protein || 150}g
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-warning/10">
                      <p className="text-xs text-text-secondary mb-1">Carbs</p>
                      <p className="text-lg font-bold font-mono text-warning">
                        {plan.nutrition.dailyMacros?.carbs || 200}g
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-error/10">
                      <p className="text-xs text-text-secondary mb-1">Fat</p>
                      <p className="text-lg font-bold font-mono text-error">
                        {plan.nutrition.dailyMacros?.fat || 65}g
                      </p>
                    </div>
                  </div>

                  {plan.nutrition.mealTiming && (
                    <div className="p-4 rounded-lg bg-bg-elevated">
                      <p className="text-sm font-medium text-text-primary mb-2">Meal Timing</p>
                      <div className="space-y-1 text-sm text-text-secondary">
                        <p>Breakfast: {plan.nutrition.mealTiming.breakfast}</p>
                        <p>Lunch: {plan.nutrition.mealTiming.lunch}</p>
                        <p>Dinner: {plan.nutrition.mealTiming.dinner}</p>
                        {plan.nutrition.mealTiming.fastingWindow && (
                          <p>Fasting Window: {plan.nutrition.mealTiming.fastingWindow} hours</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Exercise Plan */}
            <motion.div
              variants={glassEntranceAnimation}
              initial="initial"
              animate="animate"
              className="glass-card p-6 rounded-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <Dumbbell className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold text-text-primary">What Exercises to Do</h2>
              </div>
              
              {plan.exercise && plan.exercise.types && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-primary/10">
                    <p className="text-sm font-medium text-text-primary mb-2">Cardio</p>
                    <p className="text-xs text-text-secondary">
                      {plan.exercise.types.cardio?.frequency || 3}x/week, {plan.exercise.types.cardio?.duration || 30} min
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-success/10">
                    <p className="text-sm font-medium text-text-primary mb-2">Strength</p>
                    <p className="text-xs text-text-secondary">
                      {plan.exercise.types.strength?.frequency || 2}x/week, {plan.exercise.types.strength?.duration || 45} min
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-warning/10">
                    <p className="text-sm font-medium text-text-primary mb-2">Mobility</p>
                    <p className="text-xs text-text-secondary">
                      {plan.exercise.types.mobility?.frequency || 5}x/week, {plan.exercise.types.mobility?.duration || 15} min
                    </p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Supplements */}
            <motion.div
              variants={glassEntranceAnimation}
              initial="initial"
              animate="animate"
              className="glass-card p-6 rounded-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <Pill className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold text-text-primary">What Supplements to Take</h2>
              </div>
              
              {plan.supplements && plan.supplements.supplements && plan.supplements.supplements.length > 0 ? (
                <div className="space-y-3">
                  {plan.supplements.supplements.map((supp: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-lg bg-bg-elevated">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-text-primary">{supp.name}</span>
                        <span className="text-sm text-text-secondary">{supp.dosage}</span>
                      </div>
                      <p className="text-xs text-text-secondary mb-1">Timing: {supp.timing}</p>
                      {supp.benefits && supp.benefits.length > 0 && (
                        <ul className="text-xs text-text-tertiary space-y-1">
                          {supp.benefits.map((benefit: string, i: number) => (
                            <li key={i}>• {benefit}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-secondary">No supplements recommended at this time.</p>
              )}
            </motion.div>

            {/* Sleep Protocol */}
            <motion.div
              variants={glassEntranceAnimation}
              initial="initial"
              animate="animate"
              className="glass-card p-6 rounded-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <Moon className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold text-text-primary">Sleep Optimization</h2>
              </div>
              
              {plan.sleep && (
                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-bg-elevated">
                    <p className="text-sm font-medium text-text-primary mb-2">Ideal Sleep Schedule</p>
                    <p className="text-xs text-text-secondary">
                      Bedtime: {plan.sleep.idealBedtime} | Wake: {plan.sleep.idealWakeTime}
                    </p>
                  </div>
                  {plan.sleep.environment && (
                    <div className="p-4 rounded-lg bg-bg-elevated">
                      <p className="text-sm font-medium text-text-primary mb-2">Environment</p>
                      <p className="text-xs text-text-secondary">
                        Temperature: {plan.sleep.environment.temperature}°F | 
                        Light: {plan.sleep.environment.light} | 
                        Humidity: {plan.sleep.environment.humidity}%
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Stress Management */}
            <motion.div
              variants={glassEntranceAnimation}
              initial="initial"
              animate="animate"
              className="glass-card p-6 rounded-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <Heart className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold text-text-primary">Stress Management</h2>
              </div>
              
              {plan.stress && (
                <div className="space-y-3">
                  {plan.stress.meditation && (
                    <div className="p-4 rounded-lg bg-bg-elevated">
                      <p className="text-sm font-medium text-text-primary mb-1">Meditation</p>
                      <p className="text-xs text-text-secondary">
                        {plan.stress.meditation.type} - {plan.stress.meditation.duration} min, {plan.stress.meditation.frequency}
                      </p>
                    </div>
                  )}
                  {plan.stress.breathwork && (
                    <div className="p-4 rounded-lg bg-bg-elevated">
                      <p className="text-sm font-medium text-text-primary mb-1">Breathwork</p>
                      <p className="text-xs text-text-secondary">
                        {plan.stress.breathwork.type} - {plan.stress.breathwork.duration} min, {plan.stress.breathwork.frequency}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Expected Results */}
            {plan.expectedResults && (
              <motion.div
                variants={glassEntranceAnimation}
                initial="initial"
                animate="animate"
                className="glass-card premium p-6 rounded-2xl border-2 border-amber-400/50"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-6 h-6 text-amber-500" />
                  <h2 className="text-xl font-semibold text-text-primary">Expected Results</h2>
                </div>
                
                <div className="space-y-4">
                  {plan.expectedResults.thirtyDays && plan.expectedResults.thirtyDays.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-text-primary mb-2">30 Days</p>
                      <ul className="text-xs text-text-secondary space-y-1">
                        {plan.expectedResults.thirtyDays.map((result: string, idx: number) => (
                          <li key={idx}>• {result}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {plan.expectedResults.ninetyDays && plan.expectedResults.ninetyDays.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-text-primary mb-2">90 Days</p>
                      <ul className="text-xs text-text-secondary space-y-1">
                        {plan.expectedResults.ninetyDays.map((result: string, idx: number) => (
                          <li key={idx}>• {result}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </>
        ) : (
          <motion.div
            variants={glassEntranceAnimation}
            initial="initial"
            animate="animate"
            className="glass-card p-12 rounded-2xl text-center"
          >
            <p className="text-text-secondary mb-4">No longevity plan generated yet.</p>
            <button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="btn-primary"
            >
              {generateMutation.isPending ? 'Generating...' : 'Generate Your Plan'}
            </button>
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
}
