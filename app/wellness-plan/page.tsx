'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from '@/hooks/useAccount';
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';
import AnimatedButton from '@/components/ui/AnimatedButton';
import PageTransition from '@/components/ui/PageTransition';
import { Target, CheckCircle, Circle, Calendar, TrendingUp, Sparkles } from 'lucide-react';
import ProgressBar from '@/components/ui/ProgressBar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/ToastProvider';

export default function WellnessPlanPage() {
  const { address } = useAccount();
  const { showToast } = useToast();
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    // Mock data for now
    setTimeout(() => {
      setPlan({
        weeklyTasks: [
          { day: 'Monday', tasks: [{ description: '30-minute HIIT workout', completed: true }, { description: '10-minute meditation', completed: false }] },
          { day: 'Tuesday', tasks: [{ description: 'Drink 3L of water', completed: true }, { description: 'Read for 20 minutes', completed: true }] },
          { day: 'Wednesday', tasks: [{ description: 'Active recovery (yoga)', completed: false }, { description: 'Plan meals for the week', completed: false }] },
          { day: 'Thursday', tasks: [{ description: 'Strength training (upper body)', completed: false }, { description: 'Journal for 10 minutes', completed: false }] },
          { day: 'Friday', tasks: [{ description: 'Cardio session (45 mins)', completed: false }, { description: 'Social connection time', completed: false }] },
          { day: 'Saturday', tasks: [{ description: 'Long walk in nature', completed: false }, { description: 'Review weekly progress', completed: false }] },
          { day: 'Sunday', tasks: [{ description: 'Rest & recovery', completed: false }, { description: 'Prepare for the week ahead', completed: false }] },
        ]
      });
      setLoading(false);
    }, 1500);
  }, [address]);

  const generatePlan = async () => {
    setGenerating(true);
    // Mock generation
    setTimeout(() => {
      showToast({ title: 'Plan Generated!', description: 'Your new wellness plan is ready.', variant: 'success' });
      setGenerating(false);
    }, 2000);
  };

  const toggleTask = (dayIndex: number, taskIndex: number) => {
    const newPlan = { ...plan };
    newPlan.weeklyTasks[dayIndex].tasks[taskIndex].completed = !newPlan.weeklyTasks[dayIndex].tasks[taskIndex].completed;
    setPlan(newPlan);
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" text="Loading your wellness plan..." />
        </div>
      </PageTransition>
    );
  }

  if (!plan) {
    return (
      <PageTransition>
        <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="glass-card text-center py-12 px-8 max-w-lg mx-auto">
            <Target className="w-16 h-16 text-accent-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-text-primary mb-4">
              Your Personalized Wellness Plan Awaits
            </h1>
            <p className="text-text-secondary mb-8">
              Generate a unique, week-by-week roadmap to optimal health based on your personal data.
            </p>
            <AnimatedButton
              onClick={generatePlan}
              disabled={generating}
            >
              {generating ? 'Generating...' : 'Generate My Plan'}
            </AnimatedButton>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  const totalTasks = plan.weeklyTasks.reduce((acc: number, day: any) => acc + (day.tasks?.length || 0), 0);
  const completedTasks = plan.weeklyTasks.reduce((acc: number, day: any) => acc + (day.tasks?.filter((t: any) => t.completed).length || 0), 0);
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <PageTransition>
      <div className="p-4 sm:p-6 lg:p-8">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-crypto-gradient text-transparent bg-clip-text mb-2">
                Your Wellness Plan
              </h1>
              <p className="text-base text-text-secondary">
                Your personalized roadmap to optimal health.
              </p>
            </div>
            <AnimatedButton onClick={generatePlan} variant="secondary" disabled={generating} icon={<Sparkles className="w-5 h-5" />}>
              Adjust Plan
            </AnimatedButton>
          </div>

          <motion.div variants={fadeInUp} className="glass-card p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-text-secondary mb-1">Weekly Progress</p>
                <p className="text-2xl font-bold text-text-primary">
                  {completedTasks} / {totalTasks} tasks completed
                </p>
              </div>
              <p className="text-3xl font-bold text-accent-primary">
                {Math.round(progressPercentage)}%
              </p>
            </div>
            <ProgressBar value={progressPercentage} size="lg" animated />
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {plan.weeklyTasks?.map((day: any, dayIndex: number) => (
              <motion.div key={dayIndex} variants={fadeInUp} className="glass-card-hover p-6 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-6 h-6 text-accent-primary" />
                  <h3 className="font-bold text-xl text-text-primary">{day.day}</h3>
                </div>
                <div className="space-y-3">
                  {day.tasks?.map((task: any, taskIndex: number) => (
                    <motion.button
                      key={taskIndex}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleTask(dayIndex, taskIndex)}
                      className="w-full flex items-start gap-3 p-3 rounded-lg bg-bg-surface/50 hover:bg-bg-elevated transition-colors text-left group"
                    >
                      {task.completed ? (
                        <CheckCircle className="w-5 h-5 text-semantic-success flex-shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-5 h-5 text-text-tertiary flex-shrink-0 mt-0.5 group-hover:text-accent-primary" />
                      )}
                      <span className={`text-sm flex-1 ${
                        task.completed
                          ? 'line-through text-text-tertiary'
                          : 'text-text-primary'
                      }`}>
                        {task.description}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
