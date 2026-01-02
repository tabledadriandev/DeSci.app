'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations/variants';
import AnimatedCard from '@/components/ui/AnimatedCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import PageTransition from '@/components/ui/PageTransition';
import { TrendingUp, TrendingDown, Target, Award, Heart, Zap, Brain, Activity, Apple, Moon, BarChart3, TrendingUp as TrendingUpIcon } from 'lucide-react';
import Link from 'next/link';
import LineChart from '@/components/charts/LineChart';
import RadarChart from '@/components/charts/RadarChart';
import ProgressBar from '@/components/ui/ProgressBar';
import MainLayout from '@/components/layout/MainLayout';

export default function HealthScorePage() {
  const { address } = useAccount();
  const [healthScore, setHealthScore] = useState<any>(null);
  const [scores, setScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (address) {
      loadHealthScore();
    }
  }, [address]);

  const loadHealthScore = async () => {
    try {
      const response = await fetch(`/api/health/score?userId=${address}`);
      const data = await response.json();
      setHealthScore(data.current);
      setScores(data.history || []);
    } catch (error) {
      console.error('Error loading health score:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout title="Health Score">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="h-10 w-48 skeleton rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="skeleton h-40 rounded-2xl" />
            <div className="skeleton h-40 rounded-2xl" />
            <div className="skeleton h-40 rounded-2xl" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!healthScore) {
    return (
      <MainLayout title="Health Score">
        <div className="max-w-4xl mx-auto">
          <AnimatedCard className="text-center py-12">
            <Target className="w-16 h-16 text-accent-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold gradient-text mb-4">
              Health Score
            </h1>
            <p className="text-text-secondary mb-8 text-lg">
              Complete a health assessment to get your personalized health score.
            </p>
            <Link href="/health-assessment">
              <AnimatedButton variant="primary" size="lg">
                Start Assessment
              </AnimatedButton>
            </Link>
          </AnimatedCard>
        </div>
      </MainLayout>
    );
  }

  const categories = [
    { key: 'cardiovascularScore', label: 'Cardiovascular', icon: Heart, color: 'from-red-500 to-pink-500' },
    { key: 'metabolicScore', label: 'Metabolic', icon: Zap, color: 'from-orange-500 to-yellow-500' },
    { key: 'mentalWellnessScore', label: 'Mental Wellness', icon: Brain, color: 'from-purple-500 to-indigo-500' },
    { key: 'physicalFitnessScore', label: 'Physical Fitness', icon: Activity, color: 'from-blue-500 to-cyan-500' },
    { key: 'nutritionScore', label: 'Nutrition', icon: Apple, color: 'from-green-500 to-emerald-500' },
    { key: 'sleepScore', label: 'Sleep', icon: Moon, color: 'from-indigo-500 to-purple-500' },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-semantic-success';
    if (score >= 60) return 'text-semantic-warning';
    return 'text-semantic-error';
  };

  const overallScore = healthScore.overallScore || 0;

  return (
    <MainLayout title="Health Score" subtitle="Your comprehensive wellness assessment">
      <div className="max-w-6xl mx-auto">

          {/* Overall Score */}
          <div className="mb-8">
            <motion.div
              initial="initial"
              animate="animate"
              variants={fadeInUp}
              transition={{ delay: 0.1 }}
            >
            <AnimatedCard className="text-center py-8">
              <div className="relative inline-block mb-4">
                <div className="w-32 h-32 rounded-full bg-gradient-primary flex items-center justify-center">
                  <div className="text-center">
                    <div className={`text-5xl font-bold ${getScoreColor(overallScore)}`}>
                      {overallScore}
                    </div>
                    <div className="text-sm text-text-secondary mt-1">Overall</div>
                  </div>
                </div>
                <div className="absolute -top-2 -right-2">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                  >
                    <Award className="w-8 h-8 text-semantic-warning" />
                  </motion.div>
                </div>
              </div>
              <p className="text-text-secondary">
                {overallScore >= 80
                  ? 'Excellent! You\'re in great health.'
                  : overallScore >= 60
                  ? 'Good! There\'s room for improvement.'
                  : 'Let\'s work together to improve your health.'}
              </p>
            </AnimatedCard>
            </motion.div>
          </div>

          {/* Category Scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.2 }}
            >
            {categories.map((category: typeof categories[0], index: number) => {
              const Icon = category.icon;
              const score = healthScore[category.key] || 0;
              return (
                <motion.div key={category.key} variants={staggerItem}>
                  <AnimatedCard hover delay={index * 0.05}>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
                        {score}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">
                      {category.label}
                    </h3>
                    <ProgressBar
                      value={score}
                      max={100}
                      color={
                        score >= 80
                          ? 'success'
                          : score >= 60
                          ? 'warning'
                          : 'error'
                      }
                      size="md"
                      animated
                      showValue={false}
                    />
                  </AnimatedCard>
                </motion.div>
              );
            })}
            </motion.div>
          </div>

          {/* Advanced Charts Section */}
          {scores.length > 0 && (
            <div className="mt-8 space-y-8">
              {/* Score Trend Chart */}
              <motion.div
                initial="initial"
                animate="animate"
                variants={fadeInUp}
                transition={{ delay: 0.4 }}
              >
                <AnimatedCard>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-6 h-6 text-accent-primary" />
                      <h2 className="text-2xl font-bold text-text-primary">Score Trend</h2>
                    </div>
                    {scores.length >= 2 && (
                      <div className="flex items-center gap-2">
                        {(() => {
                          const trend = scores[0].overallScore - scores[1].overallScore;
                          const isPositive = trend > 0;
                          return (
                            <>
                              {isPositive ? (
                                <TrendingUpIcon className="w-5 h-5 text-semantic-success" />
                              ) : (
                                <TrendingDown className="w-5 h-5 text-semantic-error" />
                              )}
                              <span className={`text-sm font-semibold ${isPositive ? 'text-semantic-success' : 'text-semantic-error'}`}>
                                {isPositive ? '+' : ''}{trend.toFixed(1)} points
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                  <div className="h-64">
                    <LineChart
                      data={{
                        labels: [...scores].reverse().map((s: typeof scores[0]) => 
                          new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        ),
                        datasets: [
                          {
                            label: 'Overall Score',
                            data: [...scores].reverse().map((s: typeof scores[0]) => s.overallScore),
                            borderColor: '#0F4C81',
                            backgroundColor: 'rgba(15, 76, 129, 0.3)',
                            tension: 0.4,
                            fill: true,
                          },
                        ],
                      }}
                      height={256}
                    />
                  </div>
                </AnimatedCard>
              </motion.div>

              {/* Category Radar Chart */}
              <motion.div
                initial="initial"
                animate="animate"
                variants={fadeInUp}
                transition={{ delay: 0.5 }}
              >
                <AnimatedCard>
                  <div className="flex items-center gap-3 mb-6">
                    <Target className="w-6 h-6 text-accent-primary" />
                    <h2 className="text-2xl font-bold text-text-primary">Category Breakdown</h2>
                  </div>
                  <div className="h-80">
                    <RadarChart
                      data={{
                        labels: ['Cardiovascular', 'Metabolic', 'Mental', 'Fitness', 'Nutrition', 'Sleep'],
                        datasets: [
                          {
                            label: 'Your Score',
                            data: [
                              healthScore.cardiovascularScore || 0,
                              healthScore.metabolicScore || 0,
                              healthScore.mentalWellnessScore || 0,
                              healthScore.physicalFitnessScore || 0,
                              healthScore.nutritionScore || 0,
                              healthScore.sleepScore || 0,
                            ],
                            backgroundColor: 'rgba(15, 76, 129, 0.3)',
                            borderColor: '#0F4C81',
                          },
                        ],
                      }}
                      height={320}
                    />
                  </div>
                </AnimatedCard>
              </motion.div>

              {/* Category Trends */}
              <motion.div
                initial="initial"
                animate="animate"
                variants={fadeInUp}
                transition={{ delay: 0.6 }}
              >
                <AnimatedCard>
                  <h2 className="text-2xl font-bold text-text-primary mb-6">Category Trends</h2>
                  <div className="h-64">
                    <LineChart
                      data={{
                        labels: [...scores].reverse().map((s: typeof scores[0]) => 
                          new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        ),
                        datasets: [
                          {
                            label: 'Cardiovascular',
                            data: [...scores].reverse().map((s: typeof scores[0]) => s.cardiovascularScore || 0),
                            borderColor: '#EF4444',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            tension: 0.4,
                          },
                          {
                            label: 'Metabolic',
                            data: [...scores].reverse().map((s: typeof scores[0]) => s.metabolicScore || 0),
                            borderColor: '#F59E0B',
                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                            tension: 0.4,
                          },
                          {
                            label: 'Mental',
                            data: [...scores].reverse().map((s: typeof scores[0]) => s.mentalWellnessScore || 0),
                            borderColor: '#8B5CF6',
                            backgroundColor: 'rgba(139, 92, 246, 0.1)',
                            tension: 0.4,
                          },
                          {
                            label: 'Fitness',
                            data: [...scores].reverse().map((s: typeof scores[0]) => s.physicalFitnessScore || 0),
                            borderColor: '#3B82F6',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            tension: 0.4,
                          },
                          {
                            label: 'Nutrition',
                            data: [...scores].reverse().map((s: typeof scores[0]) => s.nutritionScore || 0),
                            borderColor: '#10B981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            tension: 0.4,
                          },
                          {
                            label: 'Sleep',
                            data: [...scores].reverse().map((s: typeof scores[0]) => s.sleepScore || 0),
                            borderColor: '#6366F1',
                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                            tension: 0.4,
                          },
                        ],
                      }}
                      height={256}
                    />
                  </div>
                </AnimatedCard>
              </motion.div>

              {/* Recent History List */}
              <motion.div
                initial="initial"
                animate="animate"
                variants={fadeInUp}
                transition={{ delay: 0.7 }}
              >
                <AnimatedCard>
                  <h2 className="text-2xl font-bold text-text-primary mb-4">Recent History</h2>
                  <div className="space-y-3">
                    {scores.slice(0, 5).map((score: typeof scores[0], index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-text-primary">
                            {new Date(score.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                          <div className="text-sm text-text-secondary">Overall Score</div>
                        </div>
                        <div className={`text-2xl font-bold ${getScoreColor(score.overallScore)}`}>
                          {score.overallScore}
                        </div>
                      </div>
                    ))}
                  </div>
                </AnimatedCard>
              </motion.div>
            </div>
          )}
        </div>
      </MainLayout>
  );
}
