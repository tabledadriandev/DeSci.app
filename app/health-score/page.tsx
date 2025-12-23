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
import { LineChart, Line, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import ProgressBar from '@/components/ui/ProgressBar';

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
      <PageTransition>
        <div className="min-h-screen  p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="h-10 w-48 skeleton rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="skeleton h-40 rounded-2xl" />
              <div className="skeleton h-40 rounded-2xl" />
              <div className="skeleton h-40 rounded-2xl" />
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!healthScore) {
    return (
      <PageTransition>
        <div className="min-h-screen  p-4 md:p-8">
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
        </div>
      </PageTransition>
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
    <PageTransition>
      <div className="min-h-screen  p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <motion.div
              initial="initial"
              animate="animate"
              variants={fadeInUp}
            >
            <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-2">
              Health Score
            </h1>
            <p className="text-text-secondary text-lg">
              Your comprehensive wellness assessment
            </p>
            </motion.div>
          </div>

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
            {categories.map((category, index) => {
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
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={[...scores].reverse().map((s) => ({
                          date: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                          score: s.overallScore,
                          cardiovascular: s.cardiovascularScore || 0,
                          metabolic: s.metabolicScore || 0,
                          mental: s.mentalWellnessScore || 0,
                          fitness: s.physicalFitnessScore || 0,
                          nutrition: s.nutritionScore || 0,
                          sleep: s.sleepScore || 0,
                        }))}
                      >
                        <defs>
                          <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0F4C81" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#0F4C81" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E8E3DC" />
                        <XAxis
                          dataKey="date"
                          stroke="#6B6560"
                          fontSize={12}
                          tickLine={false}
                        />
                        <YAxis
                          domain={[0, 100]}
                          stroke="#6B6560"
                          fontSize={12}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #E8E3DC',
                            borderRadius: '8px',
                            padding: '8px 12px',
                          }}
                          labelStyle={{ color: '#1A1A1A', fontWeight: '600', marginBottom: '4px' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="score"
                          stroke="#0F4C81"
                          strokeWidth={2}
                          fill="url(#scoreGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
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
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart
                        data={[
                          {
                            category: 'Cardiovascular',
                            score: healthScore.cardiovascularScore || 0,
                            fullMark: 100,
                          },
                          {
                            category: 'Metabolic',
                            score: healthScore.metabolicScore || 0,
                            fullMark: 100,
                          },
                          {
                            category: 'Mental',
                            score: healthScore.mentalWellnessScore || 0,
                            fullMark: 100,
                          },
                          {
                            category: 'Fitness',
                            score: healthScore.physicalFitnessScore || 0,
                            fullMark: 100,
                          },
                          {
                            category: 'Nutrition',
                            score: healthScore.nutritionScore || 0,
                            fullMark: 100,
                          },
                          {
                            category: 'Sleep',
                            score: healthScore.sleepScore || 0,
                            fullMark: 100,
                          },
                        ]}
                      >
                        <PolarGrid stroke="#E8E3DC" />
                        <PolarAngleAxis
                          dataKey="category"
                          tick={{ fill: '#6B6560', fontSize: 12 }}
                        />
                        <PolarRadiusAxis
                          angle={90}
                          domain={[0, 100]}
                          tick={{ fill: '#8B8580', fontSize: 10 }}
                        />
                        <Radar
                          name="Your Score"
                          dataKey="score"
                          stroke="#0F4C81"
                          fill="#0F4C81"
                          fillOpacity={0.3}
                          strokeWidth={2}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #E8E3DC',
                            borderRadius: '8px',
                            padding: '8px 12px',
                          }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
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
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={[...scores].reverse().map((s) => ({
                          date: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                          Cardiovascular: s.cardiovascularScore || 0,
                          Metabolic: s.metabolicScore || 0,
                          Mental: s.mentalWellnessScore || 0,
                          Fitness: s.physicalFitnessScore || 0,
                          Nutrition: s.nutritionScore || 0,
                          Sleep: s.sleepScore || 0,
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E8E3DC" />
                        <XAxis
                          dataKey="date"
                          stroke="#6B6560"
                          fontSize={12}
                          tickLine={false}
                        />
                        <YAxis
                          domain={[0, 100]}
                          stroke="#6B6560"
                          fontSize={12}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #E8E3DC',
                            borderRadius: '8px',
                            padding: '8px 12px',
                          }}
                        />
                        <Legend
                          wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
                          iconType="line"
                        />
                        <Line
                          type="monotone"
                          dataKey="Cardiovascular"
                          stroke="#EF4444"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="Metabolic"
                          stroke="#F59E0B"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="Mental"
                          stroke="#8B5CF6"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="Fitness"
                          stroke="#3B82F6"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="Nutrition"
                          stroke="#10B981"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="Sleep"
                          stroke="#6366F1"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
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
                    {scores.slice(0, 5).map((score, index) => (
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
      </div>
    </PageTransition>
  );
}
