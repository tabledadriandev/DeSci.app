'use client';

import { useState, useEffect } from 'react';
import { useAccount } from '@/hooks/useAccount';
import { motion } from 'framer-motion';
import PageTransition from '@/components/ui/PageTransition';
import AnimatedButton from '@/components/ui/AnimatedButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ProgressBar from '@/components/ui/ProgressBar';
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Brain, 
  Droplet, 
  AlertTriangle,
  Upload,
  BarChart3,
  RefreshCw,
  Sparkles,
  FlaskConical,
  Bug,
} from 'lucide-react';

export default function MicrobiomePage() {
  const { address } = useAccount();
  const [loading, setLoading] = useState(true);
  const [latestResult, setLatestResult] = useState<any>(null);
  const [trends, setTrends] = useState<any>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [correlations, setCorrelations] = useState<any>(null);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter'>('month');

  useEffect(() => {
    // Mock loading data
    setTimeout(() => {
      setLatestResult({
        shannonIndex: 3.8,
        firmicutesPercentage: 50,
        bacteroidetesPercentage: 30,
        actinobacteriaPercentage: 10,
        proteobacteriaPercentage: 5,
        inflammationRisk: 6.5,
        gutPermeabilityRisk: 7.2,
        digestionScore: 78,
        akkermansiaMuciniphila: 0.03,
        bifidobacterium: 0.15,
        lactobacillus: 0.10,
        faecalibacteriumPrausnitzii: 0.08,
        pathogens: [{ name: 'Candida Albicans', presence: true, level: 'high' }],
      });
      setTrends({
        diversityTrend: 'increasing',
        inflammationTrend: 'decreasing',
      });
      setInsights([
        'Your gut diversity is improving significantly.',
        'Consider increasing prebiotic fiber intake to further support Bifidobacterium.',
        'Monitor inflammation markers in your next blood test.',
      ]);
      setCorrelations({
        correlations: {
          diversityMoodCorrelation: 0.75,
          diversityStressCorrelation: -0.60,
        },
        serotoninAnalysis: {
          serotoninProductionPotential: 85,
          tryptophanAvailability: 'optimal',
        },
      });
      setLoading(false);
    }, 1500);
  }, [address, timeframe]);

  const formatCorrelation = (corr: number | undefined): string => {
    if (corr === undefined || corr === null) return 'N/A';
    const percentage = (corr * 100).toFixed(0);
    const sign = corr > 0 ? '+' : '';
    return `${sign}${percentage}%`;
  };

  const getDiversityStatus = (shannonIndex: number | null | undefined): { status: string; color: string } => {
    if (!shannonIndex) return { status: 'Unknown', color: 'text-text-tertiary' };
    if (shannonIndex > 4.0) return { status: 'Excellent', color: 'text-semantic-success' };
    if (shannonIndex > 3.0) return { status: 'Good', color: 'text-accent-primary' };
    if (shannonIndex > 2.0) return { status: 'Fair', color: 'text-semantic-warning' };
    return { status: 'Low', color: 'text-semantic-error' };
  };

  return (
    <PageTransition>
      <div className="p-4 sm:p-6 lg:p-8">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <FlaskConical className="w-8 h-8 text-accent-primary" />
            <h1 className="text-3xl md:text-4xl font-bold bg-crypto-gradient text-transparent bg-clip-text">Microbiome Analysis</h1>
          </div>
          <AnimatedButton onClick={() => setLoading(true)} variant="secondary" icon={<RefreshCw className="w-5 h-5" />}>
            Refresh
          </AnimatedButton>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <LoadingSpinner text="Analyzing your gut data..." />
          </div>
        ) : !latestResult ? (
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="glass-card p-8 text-center my-8">
            <Activity className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-text-primary mb-2">No Microbiome Data Yet</h2>
            <p className="text-text-secondary mb-6">
              Upload your microbiome test results from Viome, Ombre, Tiny Health, or Thorne to get started.
            </p>
            <AnimatedButton icon={<Upload className="w-5 h-5" />}>
              Upload Test Results
            </AnimatedButton>
          </motion.div>
        ) : (
          <>
            {/* Diversity Score */}
            <motion.div variants={fadeInUp} className="glass-card-hover p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-text-primary">Diversity Score</h2>
                <span className={`px-4 py-1 rounded-full text-sm font-medium border ${getDiversityStatus(latestResult.shannonIndex).color} ${getDiversityStatus(latestResult.shannonIndex).color.replace('text', 'bg').replace('-400', '/10').replace('-primary', '/10')}`}>
                  {getDiversityStatus(latestResult.shannonIndex).status}
                </span>
              </div>
              <div className="flex items-baseline gap-4">
                <p className="text-5xl font-bold text-accent-primary">
                  {latestResult.shannonIndex?.toFixed(2) || 'N/A'}
                </p>
                <p className="text-text-secondary">Shannon Index</p>
              </div>
              {trends && trends.diversityTrend !== 'insufficient_data' && (
                <div className="flex items-center gap-2 mt-4 text-sm text-text-secondary">
                  {trends.diversityTrend === 'increasing' ? (
                    <TrendingUp className="w-5 h-5 text-semantic-success" />
                  ) : trends.diversityTrend === 'decreasing' ? (
                    <TrendingDown className="w-5 h-5 text-semantic-error" />
                  ) : null}
                  <span>
                    {trends.diversityTrend === 'increasing' && 'Improving Trend'}
                    {trends.diversityTrend === 'decreasing' && 'Declining Trend'}
                    {trends.diversityTrend === 'stable' && 'Stable'}
                  </span>
                </div>
              )}
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Phyla Distribution */}
              <motion.div variants={fadeInUp} className="glass-card p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-text-primary">
                  <BarChart3 className="w-5 h-5 text-accent-primary" />
                  Phyla Distribution
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Firmicutes', value: latestResult.firmicutesPercentage, color: 'bg-blue-400' },
                    { label: 'Bacteroidetes', value: latestResult.bacteroidetesPercentage, color: 'bg-green-400' },
                    { label: 'Actinobacteria', value: latestResult.actinobacteriaPercentage, color: 'bg-purple-400' },
                    { label: 'Proteobacteria', value: latestResult.proteobacteriaPercentage, color: 'bg-orange-400' },
                  ].map((phyla, idx) => phyla.value !== undefined && (
                    <div key={idx}>
                      <div className="flex justify-between mb-1 text-sm text-text-secondary">
                        <span>{phyla.label}</span>
                        <span className="font-medium text-text-primary">{phyla.value?.toFixed(1)}%</span>
                      </div>
                      <ProgressBar value={phyla.value || 0} max={100} color="primary" size="sm" animated showValue={false} className={phyla.color} />
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Health Indicators */}
              <motion.div variants={fadeInUp} className="glass-card p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-text-primary">
                  <Activity className="w-5 h-5 text-accent-primary" />
                  Health Indicators
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Inflammation Risk', value: latestResult.inflammationRisk, color: 'error' },
                    { label: 'Gut Permeability Risk', value: latestResult.gutPermeabilityRisk, color: 'error' },
                    { label: 'Digestion Score', value: latestResult.digestionScore, color: 'primary' },
                  ].map((indicator, idx) => indicator.value !== undefined && indicator.value !== null && (
                    <div key={idx}>
                      <div className="flex justify-between mb-2 text-sm text-text-secondary">
                        <span>{indicator.label}</span>
                        <span className={`font-bold ${indicator.color === 'error' ? 'text-semantic-error' : indicator.color === 'primary' ? 'text-accent-primary' : ''}`}>
                          {indicator.value?.toFixed(1)}{indicator.label.includes('Score') ? '/100' : '/10'}
                        </span>
                      </div>
                      <ProgressBar value={indicator.value || 0} max={indicator.label.includes('Score') ? 100 : 10} color={indicator.color as any} size="sm" animated showValue={false} />
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Beneficial Bacteria */}
            {(latestResult.akkermansiaMuciniphila || latestResult.bifidobacterium || latestResult.lactobacillus || latestResult.faecalibacteriumPrausnitzii) ? (
              <motion.div variants={fadeInUp} className="glass-card p-6 mb-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-text-primary">
                  <Droplet className="w-5 h-5 text-accent-primary" />
                  Key Beneficial Bacteria
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: 'Akkermansia', value: latestResult.akkermansiaMuciniphila, color: 'text-blue-400' },
                    { name: 'Bifidobacterium', value: latestResult.bifidobacterium, color: 'text-green-400' },
                    { name: 'Lactobacillus', value: latestResult.lactobacillus, color: 'text-purple-400' },
                    { name: 'Faecalibacterium', value: latestResult.faecalibacteriumPrausnitzii, color: 'text-orange-400' },
                  ].map((bact, idx) => bact.value !== undefined && bact.value !== null && (
                    <div key={idx} className="glass-card p-4 text-center">
                      <p className={`text-2xl font-bold ${bact.color}`}>{(bact.value * 100).toFixed(2)}%</p>
                      <p className="text-sm text-text-secondary mt-1">{bact.name}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : null}

            {/* Insights */}
            {insights.length > 0 && (
              <motion.div variants={fadeInUp} className="glass-card p-6 mb-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-text-primary">
                  <Sparkles className="w-5 h-5 text-accent-primary" />
                  Insights & Recommendations
                </h3>
                <ul className="space-y-2 list-disc pl-5 text-text-secondary">
                  {insights.map((insight, idx) => (
                    <li key={idx} className="text-sm">{insight}</li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Gut-Brain Axis Correlations */}
            {correlations && (
              <motion.div variants={fadeInUp} className="glass-card p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-text-primary">
                    <Brain className="w-5 h-5 text-accent-primary" />
                    Gut-Brain Axis Correlations
                  </h3>
                  <select
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value as 'week' | 'month' | 'quarter')}
                    className="px-3 py-2 bg-bg-surface border border-border-medium rounded-lg text-text-primary text-sm"
                  >
                    <option value="week">Last Week</option>
                    <option value="month">Last Month</option>
                    <option value="quarter">Last Quarter</option>
                  </select>
                </div>
                
                {correlations.correlations && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="glass-card p-4">
                      <p className="text-sm text-text-secondary mb-1">Diversity ↔ Mood</p>
                      <p className="text-2xl font-bold text-accent-primary">{formatCorrelation(correlations.correlations.diversityMoodCorrelation)}</p>
                    </div>
                    <div className="glass-card p-4">
                      <p className="text-sm text-text-secondary mb-1">Diversity ↔ Stress</p>
                      <p className="text-2xl font-bold text-accent-primary">{formatCorrelation(correlations.correlations.diversityStressCorrelation)}</p>
                    </div>
                  </div>
                )}

                {correlations.serotoninAnalysis && (
                  <div className="mt-4 glass-card p-4">
                    <h4 className="font-semibold text-text-primary mb-2">Serotonin Production Potential</h4>
                    <p className="text-3xl font-bold text-accent-primary mb-2">
                      {correlations.serotoninAnalysis.serotoninProductionPotential.toFixed(0)}/100
                    </p>
                    <p className="text-sm text-text-secondary">
                      Tryptophan Availability: {correlations.serotoninAnalysis.tryptophanAvailability}
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Pathogens Alert */}
            {latestResult.pathogens && Array.isArray(latestResult.pathogens) && latestResult.pathogens.some((p: any) => p.presence) && (
              <motion.div variants={fadeInUp} className="glass-card border border-semantic-error/50 bg-semantic-error/10 p-6 mb-6">
                <div className="flex items-start gap-3">
                  <Bug className="w-6 h-6 text-semantic-error mt-1" />
                  <div>
                    <h4 className="font-semibold text-semantic-error mb-2">Pathogens Detected</h4>
                    <ul className="space-y-1 list-disc pl-5">
                      {latestResult.pathogens
                        .filter((p: any) => p.presence)
                        .map((pathogen: any, idx: number) => (
                          <li key={idx} className="text-semantic-error">
                            {pathogen.name} ({pathogen.level || 'unknown'})
                          </li>
                        ))}
                    </ul>
                    <p className="text-sm text-semantic-error mt-2">
                      Consider consulting a healthcare provider for guidance.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </PageTransition>
  );
}

