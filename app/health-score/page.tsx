'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from '@/hooks/useAccount';
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';
import AnimatedButton from '@/components/ui/AnimatedButton';
import PageTransition from '@/components/ui/PageTransition';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { RadialProgress, SparklineStat, MetricCard, PremiumAreaChart, PremiumDonutChart } from '@/components/ui/PremiumCharts';
import { PremiumIcon } from '@/components/ui/PremiumBadge';
import { 
  Heart, Activity, Brain, Apple, Moon, Zap, Target, 
  TrendingUp, ChevronRight, Calendar, Award
} from 'lucide-react';
import Link from 'next/link';

export default function HealthScorePage() {
  const { address } = useAccount();
  const [healthScore, setHealthScore] = useState<any>(null);
  const [scores, setScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (address) {
      loadHealthScore();
    } else {
      // Demo data for non-connected users
      setHealthScore({
        overallScore: 78,
        cardiovascularScore: 82,
        metabolicScore: 75,
        mentalWellnessScore: 71,
        physicalFitnessScore: 85,
        nutritionScore: 68,
        sleepScore: 73,
      });
      setScores([
        { date: new Date(Date.now() - 86400000 * 6).toISOString(), overallScore: 72 },
        { date: new Date(Date.now() - 86400000 * 5).toISOString(), overallScore: 74 },
        { date: new Date(Date.now() - 86400000 * 4).toISOString(), overallScore: 73 },
        { date: new Date(Date.now() - 86400000 * 3).toISOString(), overallScore: 76 },
        { date: new Date(Date.now() - 86400000 * 2).toISOString(), overallScore: 75 },
        { date: new Date(Date.now() - 86400000 * 1).toISOString(), overallScore: 77 },
        { date: new Date().toISOString(), overallScore: 78 },
      ]);
      setLoading(false);
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
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" text="Analyzing your vitality metrics..." />
        </div>
      </PageTransition>
    );
  }

  if (!healthScore) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center p-4">
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={fadeInUp} 
            className="glass-card max-w-md w-full text-center p-10"
          >
            <PremiumIcon icon={<Target className="w-6 h-6" />} color="teal" size="lg" className="mx-auto mb-6" />
            <h1 className="text-2xl font-semibold text-text-primary mb-3">
              Vitality Index
            </h1>
            <p className="text-text-secondary mb-8 leading-relaxed">
              Complete a comprehensive health assessment to receive your personalized vitality score and longevity insights.
            </p>
            <Link href="/health-assessment">
              <AnimatedButton variant="primary" size="lg" className="w-full">
                Begin Assessment
              </AnimatedButton>
            </Link>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  const categories = [
    { key: 'cardiovascularScore', label: 'Cardiovascular', icon: Heart, color: 'rose' as const, desc: 'Heart & circulation health' },
    { key: 'metabolicScore', label: 'Metabolic', icon: Zap, color: 'amber' as const, desc: 'Energy & metabolism' },
    { key: 'mentalWellnessScore', label: 'Cognitive', icon: Brain, color: 'violet' as const, desc: 'Mental clarity & mood' },
    { key: 'physicalFitnessScore', label: 'Physical', icon: Activity, color: 'sky' as const, desc: 'Strength & endurance' },
    { key: 'nutritionScore', label: 'Nutrition', icon: Apple, color: 'emerald' as const, desc: 'Diet quality & balance' },
    { key: 'sleepScore', label: 'Recovery', icon: Moon, color: 'slate' as const, desc: 'Sleep & restoration' },
  ];

  const overallScore = healthScore.overallScore || 0;
  const scoreStatus = overallScore >= 80 ? 'optimal' : overallScore >= 60 ? 'warning' : 'alert';
  
  // Prepare chart data
  const trendData = [...scores].reverse().map((s) => ({
    name: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: s.overallScore,
  }));

  const sparklineData = scores.map(s => s.overallScore);

  const donutData = categories.map((cat, i) => ({
    name: cat.label,
    value: healthScore[cat.key] || 0,
  }));

  const getStatusColor = (score: number) => {
    if (score >= 80) return 'emerald';
    if (score >= 60) return 'amber';
    return 'rose';
  };

  const getStatusText = (score: number) => {
    if (score >= 80) return 'Optimal';
    if (score >= 60) return 'Moderate';
    return 'Needs Attention';
  };

  return (
    <PageTransition>
      <div className="cozy-container py-8">
        {/* Header */}
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={fadeInUp} 
          className="mb-10"
        >
          <div className="flex items-center gap-2 text-accent-primary text-sm font-medium mb-2">
            <Calendar className="w-4 h-4" />
            <span>Updated {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-text-primary mb-2">
            Your Vitality Index
          </h1>
          <p className="text-text-secondary text-lg">
            Comprehensive analysis of your longevity biomarkers and lifestyle factors
          </p>
        </motion.div>

        {/* Main Score Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
        >
          {/* Overall Score Card */}
          <div className="lg:col-span-1">
            <div className="premium-section h-full flex flex-col items-center justify-center text-center">
              <div className="mb-4">
                <RadialProgress
                  value={overallScore}
                  max={100}
                  size={180}
                  strokeWidth={14}
                  color={scoreStatus === 'optimal' ? '#86efac' : scoreStatus === 'warning' ? '#fcd34d' : '#fca5a5'}
                  label="Vitality Index"
                  showValue
                />
              </div>
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-3
                ${scoreStatus === 'optimal' ? 'bg-emerald-500/10 text-emerald-500' : 
                  scoreStatus === 'warning' ? 'bg-amber-500/10 text-amber-500' : 
                  'bg-rose-500/10 text-rose-500'}`}
              >
                <Award className="w-4 h-4" />
                {getStatusText(overallScore)} Range
              </div>
              <p className="text-sm text-text-secondary max-w-xs">
                {overallScore >= 80
                  ? 'Excellent vitality markers. Maintain your current protocols.'
                  : overallScore >= 60
                  ? 'Good foundation. Focus on the areas highlighted below.'
                  : 'Opportunity for significant improvement with targeted interventions.'}
              </p>
            </div>
          </div>

          {/* Trend & Quick Stats */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SparklineStat
              title="Overall Trend"
              value={overallScore}
              unit="/100"
              trend={scores.length >= 2 ? Math.round(scores[scores.length - 1].overallScore - scores[0].overallScore) : 0}
              data={sparklineData}
              color="#93c5fd"
            />
            <SparklineStat
              title="Weekly Average"
              value={Math.round(sparklineData.reduce((a, b) => a + b, 0) / sparklineData.length)}
              unit="/100"
              data={sparklineData}
              color="#d8b4fe"
            />
            <MetricCard
              icon={<Heart className="w-5 h-5 text-rose-400" />}
              title="Cardiovascular"
              value={`${healthScore.cardiovascularScore || 0}/100`}
              subtitle="Heart health index"
              status={healthScore.cardiovascularScore >= 80 ? 'optimal' : healthScore.cardiovascularScore >= 60 ? 'warning' : 'alert'}
            />
            <MetricCard
              icon={<Brain className="w-5 h-5 text-violet-400" />}
              title="Cognitive"
              value={`${healthScore.mentalWellnessScore || 0}/100`}
              subtitle="Mental clarity score"
              status={healthScore.mentalWellnessScore >= 80 ? 'optimal' : healthScore.mentalWellnessScore >= 60 ? 'warning' : 'alert'}
            />
          </div>
        </motion.div>

        {/* Category Breakdown */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="mb-8"
        >
          <div className="premium-section">
            <h2 className="premium-section-title">Category Analysis</h2>
            <p className="premium-section-subtitle">
              Detailed breakdown of your health metrics across key longevity domains
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => {
                const Icon = category.icon;
                const score = healthScore[category.key] || 0;
                const status = getStatusColor(score);
                
                return (
                  <motion.div
                    key={category.key}
                    className="glass-card p-5 group cursor-pointer"
                    whileHover={{ y: -2 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <PremiumIcon icon={<Icon className="w-5 h-5" />} color={category.color} size="md" />
                      <div className={`text-2xl font-bold text-${status}-500`}>
                        {score}
                      </div>
                    </div>
                    <h3 className="text-base font-semibold text-text-primary mb-1">
                      {category.label}
                    </h3>
                    <p className="text-xs text-text-tertiary mb-3">
                      {category.desc}
                    </p>
                    <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full bg-${status}-400`}
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Score Trend */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <div className="premium-section h-full">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="premium-section-title">Progress Over Time</h2>
                  <p className="text-sm text-text-tertiary">7-day vitality trend</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-500 font-medium">+6 pts</span>
                </div>
              </div>
              <PremiumAreaChart
                data={trendData}
                dataKeys={[{ key: 'score', color: '#93c5fd', name: 'Vitality Score' }]}
                height={240}
                showLegend={false}
              />
            </div>
          </motion.div>

          {/* Distribution Donut */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <div className="premium-section h-full">
              <h2 className="premium-section-title">Score Distribution</h2>
              <p className="text-sm text-text-tertiary mb-4">Breakdown by health domain</p>
              <PremiumDonutChart
                data={donutData}
                height={280}
                innerRadius={55}
                centerValue={overallScore}
                centerLabel="Overall"
              />
            </div>
          </motion.div>
        </div>

        {/* Action Cards */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <Link href="/health-assessment" className="block">
            <div className="glass-card-hover p-5 h-full group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-primary mb-1">Update Assessment</p>
                  <p className="text-xs text-text-tertiary">Refresh your health data</p>
                </div>
                <ChevronRight className="w-5 h-5 text-text-tertiary group-hover:text-accent-primary group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </Link>
          <Link href="/biomarkers" className="block">
            <div className="glass-card-hover p-5 h-full group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-primary mb-1">View Biomarkers</p>
                  <p className="text-xs text-text-tertiary">Detailed lab analysis</p>
                </div>
                <ChevronRight className="w-5 h-5 text-text-tertiary group-hover:text-accent-primary group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </Link>
          <Link href="/wellness-plan" className="block">
            <div className="glass-card-hover p-5 h-full group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-primary mb-1">Longevity Protocol</p>
                  <p className="text-xs text-text-tertiary">Personalized recommendations</p>
                </div>
                <ChevronRight className="w-5 h-5 text-text-tertiary group-hover:text-accent-primary group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </PageTransition>
  );
}
