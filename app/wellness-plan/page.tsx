'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations/variants';
import AnimatedCard from '@/components/ui/AnimatedCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import PageTransition from '@/components/ui/PageTransition';
import { Target, CheckCircle, Circle, Calendar, TrendingUp, Sparkles, Award } from 'lucide-react';
import ProgressBar from '@/components/ui/ProgressBar';
import EmptyState from '@/components/ui/EmptyState';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/ToastProvider';
import MainLayout from '@/components/layout/MainLayout';

export default function WellnessPlanPage() {
  const { address } = useAccount();
  const { showToast } = useToast();
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (address) {
      loadPlan();
    }
  }, [address]);

  const loadPlan = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/health/wellness-plan?userId=${address}`);
      if (!response.ok) {
        setPlan(null);
        return;
      }
      const data = await response.json();
      setPlan(data);
    } catch (error) {
      console.error('Error loading plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePlan = async () => {
    if (!address) {
      showToast({
        variant: 'error',
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to generate a wellness plan.',
      });
      return;
    }
    setGenerating(true);

    try {
      const endpoint = plan
        ? '/api/health/wellness-plan/adjust'
        : '/api/health/wellness-plan/generate';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: address }),
      });

      if (response.ok) {
        const data = await response.json();
        setPlan(data.plan);
        showToast({
          variant: 'success',
          title: plan ? 'Plan Updated!' : 'Plan Generated!',
          description: plan 
            ? 'Your wellness plan has been adjusted based on your recent progress.'
            : 'Your personalized wellness plan is ready. Start completing tasks to track your progress!',
        });
      } else {
        const error = await response.json().catch(() => ({ error: 'Failed to generate plan' }));
        if (error.error?.includes('assessment')) {
          showToast({
            variant: 'error',
            title: 'Assessment Required',
            description: 'Please complete a health assessment first before generating a wellness plan.',
          });
        } else {
          showToast({
            variant: 'error',
            title: 'Generation Failed',
            description: error.error || 'Unable to generate plan. Please try again later.',
          });
        }
      }
    } catch (error) {
      console.error('Error generating plan:', error);
      showToast({
        variant: 'error',
        title: 'Network Error',
        description: 'Unable to connect to the server. Please check your connection and try again.',
      });
    } finally {
      setGenerating(false);
    }
  };

  const toggleTask = async (dayIndex: number, taskIndex: number) => {
    if (!plan || !address) return;

    const updatedTasks = [...plan.weeklyTasks];
    const wasCompleted = updatedTasks[dayIndex].tasks[taskIndex].completed;
    updatedTasks[dayIndex].tasks[taskIndex].completed = !wasCompleted;

    try {
      const response = await fetch('/api/health/wellness-plan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: address,
          weeklyTasks: updatedTasks,
        }),
      });

      if (response.ok) {
        setPlan({ ...plan, weeklyTasks: updatedTasks });
        // Don't show toast for every task toggle to avoid spam
      } else {
        // Revert on error
        updatedTasks[dayIndex].tasks[taskIndex].completed = wasCompleted;
        setPlan({ ...plan, weeklyTasks: updatedTasks });
        showToast({
          variant: 'error',
          title: 'Update Failed',
          description: 'Unable to update task. Please try again.',
        });
      }
    } catch (error) {
      console.error('Error updating task:', error);
      // Revert on error
      updatedTasks[dayIndex].tasks[taskIndex].completed = wasCompleted;
      setPlan({ ...plan, weeklyTasks: updatedTasks });
      showToast({
        variant: 'error',
        title: 'Network Error',
        description: 'Unable to update task. Please check your connection.',
      });
    }
  };

  if (loading) {
    return (
      <MainLayout title="Wellness Plan">
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" text="Loading wellness plan..." />
        </div>
      </MainLayout>
    );
  }

  if (!plan) {
    return (
      <MainLayout title="Wellness Plan">
        <div className="max-w-4xl mx-auto">
          <AnimatedCard>
            <EmptyState
              icon={Target}
              title="No Wellness Plan Yet"
              description="Generate your personalized wellness plan based on your health assessment, biomarkers, and goals. Get a week-by-week roadmap to optimal health."
              action={{
                label: generating ? 'Generating...' : 'Generate Wellness Plan',
                onClick: generatePlan,
                variant: 'primary',
              }}
            />
          </AnimatedCard>
        </div>
      </MainLayout>
    );
  }

  // Calculate progress
  const totalTasks = plan.weeklyTasks?.reduce(
    (acc: number, day: any) => acc + (day.tasks?.length || 0),
    0
  ) || 0;
  const completedTasks = plan.weeklyTasks?.reduce(
    (acc: number, day: any) =>
      acc + (day.tasks?.filter((t: any) => t.completed).length || 0),
    0
  ) || 0;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <MainLayout title="Your Wellness Plan" subtitle="Personalized roadmap to optimal health">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInUp}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <AnimatedButton onClick={generatePlan} variant="secondary" disabled={generating}>
                <TrendingUp className="w-4 h-4 mr-2" />
                Adjust Plan
              </AnimatedButton>
            </div>

              {/* Progress Summary */}
              <AnimatedCard className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-sm text-text-secondary mb-1">Weekly Progress</div>
                      <div className="text-2xl font-bold text-text-primary">
                        {completedTasks} / {totalTasks} tasks
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-accent-primary mb-1">
                      {Math.round(progressPercentage)}%
                    </div>
                    <div className="text-xs text-text-secondary">Complete</div>
                  </div>
                </div>
                <ProgressBar
                  value={progressPercentage}
                  color={progressPercentage >= 80 ? 'success' : progressPercentage >= 50 ? 'warning' : 'primary'}
                  size="lg"
                  animated
                />
              </AnimatedCard>
            </motion.div>
          </div>

          {/* Weekly Tasks */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
            {plan.weeklyTasks?.map((day: any, dayIndex: number) => (
              <motion.div key={dayIndex} variants={staggerItem}>
                <AnimatedCard hover delay={dayIndex * 0.05} className="h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-accent-primary" />
                    <h3 className="font-bold text-text-primary">{day.day}</h3>
                  </div>
                  <div className="space-y-3">
                    {day.tasks?.map((task: any, taskIndex: number) => (
                      <motion.div
                        key={taskIndex}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <button
                          onClick={() => toggleTask(dayIndex, taskIndex)}
                          className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left group"
                        >
                        <motion.div
                          animate={{
                            scale: task.completed ? [1, 1.2, 1] : 1,
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          {task.completed ? (
                            <CheckCircle className="w-5 h-5 text-semantic-success flex-shrink-0 mt-0.5" />
                          ) : (
                            <Circle className="w-5 h-5 text-text-tertiary flex-shrink-0 mt-0.5 group-hover:text-accent-primary transition-colors" />
                          )}
                        </motion.div>
                        <span
                          className={`text-sm flex-1 ${
                            task.completed
                              ? 'line-through text-text-tertiary'
                              : 'text-text-primary group-hover:text-accent-primary'
                          } transition-colors`}
                        >
                          {task.description}
                        </span>
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </AnimatedCard>
              </motion.div>
            ))}
            </motion.div>
          </div>
        </div>
      </MainLayout>
  );
}
